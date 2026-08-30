import React, { useEffect, useRef, useState } from 'react';
import { useT } from '../i18n';
import { useAppStore } from '../services/store';
import { sendChatMessage } from '../services/ai';
import { Message, ToolCall } from '../types';
import { SearchIcon, MicIcon, SendIcon } from '../components/Icons';

const TOOL_LABEL_KEY: Record<ToolCall['name'], string> = {
  create_task: 'chat.taskAdded',
  modify_task: 'chat.taskUpdated',
  delete_task: 'chat.taskDeleted',
  create_event: 'chat.eventAdded',
  modify_event: 'chat.eventUpdated',
  delete_event: 'chat.eventDeleted',
  create_note: 'chat.noteAdded',
  modify_note: 'chat.noteUpdated',
  delete_note: 'chat.noteDeleted',
};

// Post-hoc confirmation card for a tool call that has *already executed* (see
// services/ai.ts's executeToolCall) — not a pending proposal. Mirrors mobile's
// ChatWidgetCard: shows what happened, links through to the real resource.
const ActionCard: React.FC<{ tc: ToolCall; onOpen: (kind: 'task' | 'event' | 'note', id: string) => void }> = ({ tc, onOpen }) => {
  const t = useT();
  const args = tc.arguments;
  const isTask = tc.name.endsWith('task');
  const isEvent = tc.name.endsWith('event');
  const kind: 'task' | 'event' | 'note' = isTask ? 'task' : isEvent ? 'event' : 'note';
  const id = args.taskId || args.eventId || args.noteId;
  const openLabel = kind === 'task' ? t('chat.openTask') : kind === 'event' ? t('chat.openInCalendar') : t('chat.openNote');

  return (
    <div className="action-card">
      <div className="action-card-label">{t(TOOL_LABEL_KEY[tc.name])}</div>
      {args.title && <div className="action-card-title">{args.title}</div>}
      {args.content && (
        <div className="action-card-title" style={{ fontWeight: 400 }}>
          {args.content}
        </div>
      )}
      <div className="action-card-meta">
        {args.date && <span>{args.date}</span>}
        {args.time && <span>{args.time}</span>}
        {args.category && <span className="dot-sep">{args.category}</span>}
        {args.location && <span className="dot-sep">{args.location}</span>}
      </div>
      {id && (
        <button className="action-card-link" onClick={() => onOpen(kind, id)}>
          {openLabel} →
        </button>
      )}
    </div>
  );
};

export const ChatView: React.FC = () => {
  const t = useT();
  const messages = useAppStore((s) => s.messages);
  const tasks = useAppStore((s) => s.tasks);
  const events = useAppStore((s) => s.events);

  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [dictating, setDictating] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('');

  const threadRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    threadRef.current?.scrollTo({ top: threadRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages.length, sending]);

  const handleSend = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    setInput('');
    setSending(true);
    try {
      await sendChatMessage(trimmed);
    } finally {
      setSending(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSend(input);
  };

  // Dictation: text-in-the-input only, no spoken reply — distinct from the voice overlay
  // (see the plan's reconciliation notes on keeping that distinction, same as mobile).
  const toggleDictation = () => {
    if (dictating) {
      recognitionRef.current?.stop();
      return;
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('Web Speech API not available in this browser.');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = document.documentElement.lang || 'en-US';
    recognition.interimResults = true;
    recognition.continuous = true;
    recognition.onresult = (event: any) => {
      let text = '';
      for (let i = 0; i < event.results.length; i++) text += event.results[i][0].transcript;
      setLiveTranscript(text);
    };
    recognition.onend = () => {
      setDictating(false);
      setLiveTranscript((current) => {
        if (current.trim()) setInput((prev) => (prev ? `${prev} ${current}` : current));
        return '';
      });
    };
    recognition.onerror = () => setDictating(false);
    recognitionRef.current = recognition;
    setDictating(true);
    setLiveTranscript('');
    recognition.start();
  };

  const handleOpenResource = (kind: 'task' | 'event' | 'note', id?: string) => {
    // No routing in v1 — jump the whole app to the relevant view; if a specific
    // resource id is known, that view also selects it (see e.g. TasksView's
    // grimo:selectTask listener), not just the view's list in general.
    window.dispatchEvent(new CustomEvent('grimo:navigate', { detail: kind === 'task' ? 'tasks' : kind === 'event' ? 'cal' : 'notes' }));
    if (kind === 'task' && id) window.dispatchEvent(new CustomEvent('grimo:selectTask', { detail: id }));
  };

  const todayStr = new Date().toISOString().slice(0, 10);
  const todaysEvents = events.filter((e) => e.date === todayStr).slice(0, 4);
  const openTasks = tasks.filter((t) => t.status !== 'done').slice(0, 6);

  return (
    <>
      <div className="topbar topbar-chat">
        <span className="view-title">{t('chat.title')}</span>
        <div className="topbar-right">
          <span className="pill">
            <span className="dot" />
            {t('chat.calendarConnected')}
          </span>
          <button className="icon-btn" aria-label={t('chat.title')}>
            <SearchIcon size={15} color="#1C1C1E" strokeWidth={1.7} />
          </button>
        </div>
      </div>

      <div className="main-body chat-body">
        <div className="thread-col">
          <div className="thread" ref={threadRef}>
            {messages.length === 0 && !sending ? (
              <div className="empty-state">
                <div className="empty-state-title">{t('chat.emptyTitle')}</div>
                <div className="empty-state-body">{t('chat.emptyBody')}</div>
              </div>
            ) : (
              messages
                .filter((m) => m.role !== 'system')
                .map((m: Message, i) => (
                  <div key={m.id} className={m.role === 'user' ? 'bubble-row user' : 'bubble-row assistant'} style={{ animationDelay: i === messages.length - 1 ? (m.role === 'assistant' ? '0.12s' : '0s') : undefined }}>
                    {m.role === 'user' ? (
                      <div className="bubble-user ob-up">{m.content}</div>
                    ) : (
                      <div className="assistant-block ob-up">
                        {m.content && <p className="assistant-text">{m.content}</p>}
                        {m.toolCalls?.map((tc, idx) => (
                          <ActionCard key={idx} tc={tc} onOpen={handleOpenResource} />
                        ))}
                      </div>
                    )}
                  </div>
                ))
            )}
            {sending && (
              <div className="bubble-row assistant">
                <div className="assistant-block ob-up">
                  <div className="bars-row typing-bars">
                    {[0, 0.12, 0.24].map((d) => (
                      <span key={d} className="bar" style={{ height: 14, background: 'var(--muted-light)', animationDelay: `${d}s` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="composer-wrap">
            <form className="composer" onSubmit={handleSubmit}>
              {dictating ? (
                <div className="composer-dictating">
                  <div className="dictation-status">
                    <span className="bars-row">
                      {[0, 0.12, 0.24, 0.36, 0.48].map((d) => (
                        <span key={d} className="bar bar-accent" style={{ height: 18, animationDelay: `${d}s` }} />
                      ))}
                    </span>
                    <span className="dictation-label">{t('chat.listening')}</span>
                    <span className="dictation-hint">{t('chat.sendHint')}</span>
                  </div>
                  <div className="dictation-transcript">
                    {liveTranscript}
                    <span className="caret" />
                  </div>
                </div>
              ) : (
                <input
                  className="composer-input"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={t('chat.placeholder')}
                  disabled={sending}
                />
              )}

              <div className="composer-controls">
                <span className="pill pill-ghost">{t('chat.attach')}</span>
                <span className="pill pill-ghost">{t('chat.task')}</span>
                <span className="pill pill-ghost">{t('chat.note')}</span>
                <div className="composer-actions">
                  <button type="button" className={`circle-btn${dictating ? ' active' : ''}`} onClick={toggleDictation} aria-label={t('chat.listening')}>
                    <MicIcon size={17} color={dictating ? '#fff' : '#1C1C1E'} strokeWidth={1.8} />
                  </button>
                  <button type="submit" className="circle-btn circle-btn-ink" disabled={sending} aria-label={t('common.save')}>
                    <SendIcon size={14} />
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        <div className="context-panel">
          <div className="context-label">{t('chat.today')}</div>
          {todaysEvents.length === 0 ? (
            <div className="context-empty">{t('calendar.noEvents')}</div>
          ) : (
            todaysEvents.map((ev) => (
              <div key={ev.id} className="context-card">
                <div className="context-card-title">{ev.title}</div>
                <div className="context-card-meta">{ev.time || ''}</div>
              </div>
            ))
          )}

          <div className="context-label" style={{ marginTop: 20 }}>
            {t('chat.todoList')}
          </div>
          {openTasks.length === 0 ? (
            <div className="context-empty">{t('tasks.noTasks')}</div>
          ) : (
            openTasks.map((task) => (
              <button key={task.id} className="context-task-row" onClick={() => handleOpenResource('task', task.id)}>
                <span>{task.title}</span>
              </button>
            ))
          )}
        </div>
      </div>
    </>
  );
};
