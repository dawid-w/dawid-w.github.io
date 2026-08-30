import { supabase } from './supabaseClient';
import { Message, Task, CalendarEvent, Note, ToolCall, EventCategory } from '../types';
import { useAppStore } from './store';
import { translate } from '../i18n';
import { getLanguage } from '../i18n/languageStore';

export interface AIResponse {
  textContent: string;
  toolCalls?: ToolCall[];
  limitReached?: boolean;
  quotaExceeded?: boolean;
}

// Calls the same ai-chat Edge Function the mobile app uses (supabase/functions/ai-chat) —
// identical payload shape to src/services/ai/geminiService.ts, since it's shared backend.
// historyOverride lets a caller (e.g. an ephemeral side-panel chat) supply its own
// conversation instead of the shared thread in the store.
export async function sendMessage(
  userMessage: string,
  voiceMode = false,
  historyOverride?: { role: string; content: string }[]
): Promise<AIResponse> {
  const language = getLanguage();
  const { messages, tasks, events, notes } = useAppStore.getState();
  const chatHistory = historyOverride ?? messages.filter((m) => m.role !== 'system').map((m) => ({ role: m.role, content: m.content }));

  try {
    const { data, error } = await supabase.functions.invoke('ai-chat', {
      body: {
        userMessage,
        chatHistory,
        tasks,
        events,
        notes,
        voiceMode,
        language,
      },
    });

    if (error) {
      const body = await (error as any).context?.json?.().catch(() => null);
      if (body?.error === 'limit_reached') return { textContent: '', limitReached: true };
      if (body?.error === 'quota_exceeded') return { textContent: '', quotaExceeded: true };
      console.error('ai-chat error:', body || error);
      return { textContent: translate(language, 'common.error') };
    }

    if (data?.error === 'limit_reached') return { textContent: '', limitReached: true };
    if (data?.error === 'quota_exceeded') return { textContent: '', quotaExceeded: true };

    return { textContent: data?.textContent || '', toolCalls: data?.toolCalls };
  } catch (err) {
    console.error('ai-chat call failed:', err);
    return { textContent: translate(language, 'common.error') };
  }
}

const VALID_EVENT_CATEGORIES: EventCategory[] = ['travel', 'training', 'meeting', 'vacation', 'internal'];
const isEventCategory = (v: unknown): v is EventCategory => typeof v === 'string' && (VALID_EVENT_CATEGORIES as string[]).includes(v);

// Executes a tool call immediately against the store — matches mobile's real behavior
// (src/services/ai/index.ts's executeToolCall): the assistant acts right away, the chat
// card shown afterward is a confirmation of something that already happened, not a
// pending proposal waiting on a "save" button. See the plan's reconciliation table for
// why this deliberately differs from the design doc's confirm-before-commit model.
export function executeToolCall(tc: ToolCall): void {
  const store = useAppStore.getState();
  const args = tc.arguments;

  switch (tc.name) {
    case 'create_task': {
      const title = typeof args.title === 'string' ? args.title.trim() : 'Untitled task';
      const category = typeof args.category === 'string' ? args.category.trim() : 'General';
      const priority = args.priority === 'low' || args.priority === 'high' ? args.priority : 'medium';
      const newTask = store.addTask({ title, category, status: 'todo', priority });
      args.taskId = newTask.id;
      return;
    }
    case 'delete_task': {
      if (typeof args.taskId === 'string') store.removeTask(args.taskId);
      return;
    }
    case 'modify_task': {
      const taskId = typeof args.taskId === 'string' ? args.taskId : '';
      if (!taskId || !args.field) return;
      const updates: Partial<Task> = {};
      if (args.field === 'title') updates.title = args.newValue;
      else if (args.field === 'category') updates.category = args.newValue;
      else if (args.field === 'priority' && (args.newValue === 'low' || args.newValue === 'medium' || args.newValue === 'high'))
        updates.priority = args.newValue;
      else if (args.field === 'status' && (args.newValue === 'todo' || args.newValue === 'in_progress' || args.newValue === 'done'))
        updates.status = args.newValue;
      store.updateTask(taskId, updates);
      return;
    }
    case 'create_event': {
      const title = typeof args.title === 'string' ? args.title.trim() : 'Untitled event';
      let date = typeof args.date === 'string' ? args.date.trim() : '';
      if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) date = new Date().toISOString().split('T')[0];
      let endDate = typeof args.endDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(args.endDate) ? args.endDate : undefined;
      if (endDate && endDate <= date) endDate = undefined;
      const time = typeof args.time === 'string' && /^\d{2}:\d{2}$/.test(args.time) ? args.time : undefined;
      const endTime = typeof args.endTime === 'string' && /^\d{2}:\d{2}$/.test(args.endTime) ? args.endTime : undefined;
      const location = typeof args.location === 'string' ? args.location.trim() : undefined;
      const category = isEventCategory(args.category) ? args.category : undefined;

      const existing = store.events.find(
        (e) => e.title.trim().toLowerCase() === title.toLowerCase() && e.date === date && (e.time || null) === (time || null)
      );
      if (existing) {
        args.eventId = existing.id;
        args.date = existing.date;
        return;
      }
      const newEvent = store.addEvent({ title, date, endDate, time, endTime, location, category });
      args.eventId = newEvent.id;
      args.date = date;
      return;
    }
    case 'delete_event': {
      if (typeof args.eventId === 'string') store.removeEvent(args.eventId);
      return;
    }
    case 'modify_event': {
      const eventId = typeof args.eventId === 'string' ? args.eventId : '';
      if (!eventId || !args.field) return;
      const updates: Partial<CalendarEvent> = {};
      const v = args.newValue;
      if (args.field === 'title') updates.title = v;
      else if (args.field === 'date' && v) updates.date = v;
      else if (args.field === 'time') updates.time = v || undefined;
      else if (args.field === 'endTime') updates.endTime = v || undefined;
      else if (args.field === 'endDate') updates.endDate = v || undefined;
      else if (args.field === 'location') updates.location = v || undefined;
      else if (args.field === 'category' && (isEventCategory(v) || v === '')) updates.category = (v || undefined) as EventCategory | undefined;
      store.updateEvent(eventId, updates);
      const updated = useAppStore.getState().events.find((e) => e.id === eventId);
      if (updated) {
        args.title = updated.title;
        args.time = updated.time;
        args.location = updated.location;
        args.date = updated.date;
      }
      return;
    }
    case 'create_note': {
      const content = typeof args.content === 'string' ? args.content.trim() : '';
      const newNote = store.addNote({ content });
      args.noteId = newNote.id;
      return;
    }
    case 'delete_note': {
      if (typeof args.noteId === 'string') store.removeNote(args.noteId);
      return;
    }
    case 'modify_note': {
      if (typeof args.noteId === 'string' && typeof args.content === 'string') store.updateNote(args.noteId, { content: args.content });
      return;
    }
  }
}

export function sendChatMessage(userText: string, addUserMessage = true) {
  const store = useAppStore.getState();
  if (addUserMessage) {
    store.addMessage({ id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, role: 'user', content: userText });
  }
  return sendMessage(userText).then((response) => {
    if (response.limitReached || response.quotaExceeded) return response;
    if (response.toolCalls) {
      for (const tc of response.toolCalls) executeToolCall(tc);
    }
    store.addMessage({
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      role: 'assistant',
      content: response.textContent,
      toolCalls: response.toolCalls,
    });
    return response;
  });
}

// For side-panel chats (Calendar, Notes) that intentionally don't share the main Chat
// tab's persisted thread — history lives in the caller's own component state instead of
// the store, so it naturally resets when that panel unmounts. Tool calls still execute
// against the real tasks/events/notes stores; only the conversation itself is ephemeral.
export function sendEphemeralMessage(userText: string, history: Message[]): Promise<AIResponse> {
  const chatHistory = history.filter((m) => m.role !== 'system').map((m) => ({ role: m.role, content: m.content }));
  return sendMessage(userText, false, chatHistory).then((response) => {
    if (response.toolCalls) {
      for (const tc of response.toolCalls) executeToolCall(tc);
    }
    return response;
  });
}
