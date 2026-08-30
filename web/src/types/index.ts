// Ported directly from ../../../src/types/index.ts (mobile app) — same shapes, same
// Supabase tables, same RLS. Keep these in sync if the mobile schema changes.

export interface Task {
  id: string;
  title: string;
  category: string;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
}

export type EventCategory = 'travel' | 'training' | 'meeting' | 'vacation' | 'internal';

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  endDate?: string;
  time?: string;
  endTime?: string;
  allDay?: boolean;
  location?: string;
  category?: EventCategory;
  createdAt: string;
}

export interface Note {
  id: string;
  content: string;
  createdAt: string;
}

export interface ToolCall {
  name:
    | 'create_task'
    | 'delete_task'
    | 'modify_task'
    | 'create_event'
    | 'delete_event'
    | 'modify_event'
    | 'create_note'
    | 'delete_note'
    | 'modify_note';
  arguments: {
    title?: string;
    category?: string;
    priority?: 'low' | 'medium' | 'high';
    status?: 'todo' | 'in_progress' | 'done';
    taskId?: string;
    field?: 'title' | 'category' | 'status' | 'priority' | 'date' | 'time' | 'location' | 'content' | 'endDate' | 'endTime';
    newValue?: string;
    eventId?: string;
    date?: string;
    endDate?: string;
    time?: string;
    endTime?: string;
    location?: string;
    noteId?: string;
    content?: string;
  };
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  toolCalls?: ToolCall[];
}

export type AppView = 'chat' | 'tasks' | 'cal' | 'notes' | 'settings';
export type AppLanguage = 'en' | 'pl' | 'de';
