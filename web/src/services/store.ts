import { create } from 'zustand';
import { supabase } from './supabaseClient';
import { Task, CalendarEvent, Note, Message } from '../types';

interface AppState {
  user: any | null;
  authLoading: boolean;
  bootDataSettled: boolean;

  tasks: Task[];
  events: CalendarEvent[];
  notes: Note[];
  messages: Message[];

  callsUsed: number;
  callsLimit: number;
  plan: 'free' | 'paid';
  creditsBalance: number;

  setUser: (user: any | null) => void;
  setAuthLoading: (v: boolean) => void;
  fetchUserData: () => Promise<void>;

  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => Task;
  updateTask: (id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>) => void;
  removeTask: (id: string) => void;

  addEvent: (event: Omit<CalendarEvent, 'id' | 'createdAt'>) => CalendarEvent;
  updateEvent: (id: string, updates: Partial<Omit<CalendarEvent, 'id' | 'createdAt'>>) => void;
  removeEvent: (id: string) => void;

  addNote: (note: Omit<Note, 'id' | 'createdAt'>) => Note;
  updateNote: (id: string, updates: Partial<Omit<Note, 'id' | 'createdAt'>>) => void;
  removeNote: (id: string) => void;

  addMessage: (message: Message) => void;
  clearMessages: () => void;
}

const genId = (prefix: string) => `${prefix}-${Math.random().toString(36).substring(2, 9)}`;

export const useAppStore = create<AppState>((set, get) => ({
  user: null,
  authLoading: true,
  bootDataSettled: false,

  tasks: [],
  events: [],
  notes: [],
  messages: [],

  callsUsed: 0,
  callsLimit: 20,
  plan: 'free',
  creditsBalance: 0,

  setUser: (user) => set({ user }),
  setAuthLoading: (v) => set({ authLoading: v }),

  fetchUserData: async () => {
    const user = get().user;
    if (!user) return;

    try {
      const [{ data: tasksData }, { data: eventsData }, { data: notesData }, { data: messagesData }, { data: limitRow }] =
        await Promise.all([
          supabase.from('tasks').select('*').order('created_at', { ascending: false }),
          supabase.from('events').select('*'),
          supabase.from('notes').select('*').order('created_at', { ascending: false }),
          supabase.from('messages').select('*').order('created_at', { ascending: true }),
          supabase
            .from('user_limits')
            .select('calls_used, calls_limit, plan, credits_balance_usd')
            .eq('user_id', user.id)
            .maybeSingle(),
        ]);

      set({
        tasks: (tasksData || []).map((t: any) => ({
          id: t.id,
          title: t.title,
          category: t.category,
          status: t.status,
          priority: t.priority,
          createdAt: t.created_at,
        })),
        events: (eventsData || []).map((e: any) => ({
          id: e.id,
          title: e.title,
          date: e.date,
          endDate: e.end_date ?? undefined,
          time: e.time ?? undefined,
          endTime: e.end_time ?? undefined,
          allDay: e.all_day ?? undefined,
          location: e.location ?? undefined,
          category: e.category ?? undefined,
          createdAt: e.created_at,
        })),
        notes: (notesData || []).map((n: any) => ({ id: n.id, content: n.content, createdAt: n.created_at })),
        messages: (messagesData || []).map((m: any) => ({
          id: m.id,
          role: m.role,
          content: m.content,
          toolCalls: m.tool_calls ? (typeof m.tool_calls === 'string' ? JSON.parse(m.tool_calls) : m.tool_calls) : undefined,
        })),
        callsUsed: limitRow?.calls_used ?? 0,
        callsLimit: limitRow?.calls_limit ?? 20,
        plan: limitRow?.plan ?? 'free',
        creditsBalance: limitRow?.credits_balance_usd ?? 0,
        bootDataSettled: true,
      });
    } catch (err) {
      console.error('fetchUserData failed:', err);
      set({ bootDataSettled: true });
    }
  },

  addTask: (taskData) => {
    const newTask: Task = { ...taskData, id: genId('task'), createdAt: new Date().toISOString() };
    set((state) => ({ tasks: [newTask, ...state.tasks] }));
    const user = get().user;
    if (user) {
      supabase
        .from('tasks')
        .insert({
          id: newTask.id,
          user_id: user.id,
          title: newTask.title,
          category: newTask.category,
          status: newTask.status,
          priority: newTask.priority,
          created_at: newTask.createdAt,
        })
        .then(({ error }: any) => {
          if (error) console.error('tasks insert error:', error);
        });
    }
    return newTask;
  },

  updateTask: (id, updates) => {
    set((state) => ({ tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)) }));
    supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .then(({ error }: any) => {
        if (error) console.error('tasks update error:', error);
      });
  },

  removeTask: (id) => {
    set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) }));
    supabase
      .from('tasks')
      .delete()
      .eq('id', id)
      .then(({ error }: any) => {
        if (error) console.error('tasks delete error:', error);
      });
  },

  addEvent: (eventData) => {
    const newEvent: CalendarEvent = { ...eventData, id: genId('event'), createdAt: new Date().toISOString() };
    set((state) => ({ events: [newEvent, ...state.events] }));
    const user = get().user;
    if (user) {
      const payload: any = {
        id: newEvent.id,
        user_id: user.id,
        title: newEvent.title,
        date: newEvent.date,
        time: newEvent.time || null,
        location: newEvent.location || null,
        created_at: newEvent.createdAt,
      };
      if (newEvent.endTime) payload.end_time = newEvent.endTime;
      if (newEvent.allDay) payload.all_day = newEvent.allDay;
      if (newEvent.endDate) payload.end_date = newEvent.endDate;
      if (newEvent.category) payload.category = newEvent.category;
      supabase
        .from('events')
        .insert(payload)
        .then(({ error }: any) => {
          if (error) console.error('events insert error:', error);
        });
    }
    return newEvent;
  },

  updateEvent: (id, updates) => {
    set((state) => ({ events: state.events.map((e) => (e.id === id ? { ...e, ...updates } : e)) }));
    const dbUpdates: any = { ...updates };
    if (updates.endTime !== undefined) {
      dbUpdates.end_time = updates.endTime;
      delete dbUpdates.endTime;
    }
    if (updates.allDay !== undefined) {
      dbUpdates.all_day = updates.allDay;
      delete dbUpdates.allDay;
    }
    if ('endDate' in updates) {
      dbUpdates.end_date = updates.endDate ?? null;
      delete dbUpdates.endDate;
    }
    supabase
      .from('events')
      .update(dbUpdates)
      .eq('id', id)
      .then(({ error }: any) => {
        if (error) console.error('events update error:', error);
      });
  },

  removeEvent: (id) => {
    set((state) => ({ events: state.events.filter((e) => e.id !== id) }));
    supabase
      .from('events')
      .delete()
      .eq('id', id)
      .then(({ error }: any) => {
        if (error) console.error('events delete error:', error);
      });
  },

  addNote: (noteData) => {
    const newNote: Note = { ...noteData, id: genId('note'), createdAt: new Date().toISOString() };
    set((state) => ({ notes: [newNote, ...state.notes] }));
    const user = get().user;
    if (user) {
      supabase
        .from('notes')
        .insert({ id: newNote.id, user_id: user.id, content: newNote.content, created_at: newNote.createdAt })
        .then(({ error }: any) => {
          if (error) console.error('notes insert error:', error);
        });
    }
    return newNote;
  },

  updateNote: (id, updates) => {
    set((state) => ({ notes: state.notes.map((n) => (n.id === id ? { ...n, ...updates } : n)) }));
    supabase
      .from('notes')
      .update(updates)
      .eq('id', id)
      .then(({ error }: any) => {
        if (error) console.error('notes update error:', error);
      });
  },

  removeNote: (id) => {
    set((state) => ({ notes: state.notes.filter((n) => n.id !== id) }));
    supabase
      .from('notes')
      .delete()
      .eq('id', id)
      .then(({ error }: any) => {
        if (error) console.error('notes delete error:', error);
      });
  },

  addMessage: (message) => {
    set((state) => {
      if (state.messages.some((m) => m.id === message.id)) {
        return { messages: state.messages.map((m) => (m.id === message.id ? { ...m, ...message } : m)) };
      }
      return { messages: [...state.messages, message] };
    });
    const user = get().user;
    if (user && message.role !== 'system') {
      const payload: any = { id: message.id, user_id: user.id, role: message.role, content: message.content, created_at: new Date().toISOString() };
      if (message.toolCalls && message.toolCalls.length > 0) payload.tool_calls = JSON.stringify(message.toolCalls);
      supabase
        .from('messages')
        .insert(payload)
        .then(({ error }: any) => {
          if (error) console.warn('messages insert warning:', error.message || error);
        });
    }
  },

  clearMessages: () => {
    set({ messages: [] });
    const user = get().user;
    if (user) {
      supabase
        .from('messages')
        .delete()
        .eq('user_id', user.id)
        .then(({ error }: any) => {
          if (error) console.error('messages clear error:', error);
        });
    }
  },
}));
