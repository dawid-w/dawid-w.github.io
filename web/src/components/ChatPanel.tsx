import React, { useEffect, useRef, useState } from 'react';
import { useT } from '../i18n';
import { sendEphemeralMessage } from '../services/ai';
import { Message } from '../types';
import { SendIcon } from './Icons';

const genId = () => `ephemeral-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

// Compact chat, embeddable in a side panel (Calendar, Notes) — intentionally does NOT
// share the main Chat tab's persisted thread. History lives in local state only, so it
// naturally resets whenever this panel unmounts (switching views, etc). Tool calls still
// act on the real tasks/events/notes stores via sendEphemeralMessage.
export const ChatPanel: React.FC = () => {
  const t = useT();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const threadRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    threadRef.current?.scrollTo({ top: threadRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages.length, sending]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || sending) return;
    setInput('');
    const userMessage: Message = { id: genId(), role: 'user', content: trimmed };
    const history = [...messages, userMessage];
    setMessages(history);
    setSending(true);
    try {
      const response = await sendEphemeralMessage(trimmed, history);
      setMessages((cur) => [...cur, { id: genId(), role: 'assistant', content: response.textContent, toolCalls: response.toolCalls }]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mini-chat">
      <div className="context-label">{t('chat.title')}</div>
      <div className="mini-chat-thread" ref={threadRef}>
        {messages.length === 0 && !sending ? (
          <div className="context-empty">{t('chat.emptyBody')}</div>
        ) : (
          messages.map((m: Message) => (
            <div key={m.id} className={m.role === 'user' ? 'bubble-row user' : 'bubble-row assistant'}>
              {m.role === 'user' ? (
                <div className="bubble-user mini-bubble">{m.content}</div>
              ) : (
                <div className="assistant-block mini-bubble">{m.content && <p className="assistant-text">{m.content}</p>}</div>
              )}
            </div>
          ))
        )}
        {sending && (
          <div className="bubble-row assistant">
            <div className="assistant-block mini-bubble">
              <div className="bars-row typing-bars">
                {[0, 0.12, 0.24].map((d) => (
                  <span key={d} className="bar" style={{ height: 14, background: 'var(--muted-light)', animationDelay: `${d}s` }} />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      <form className="mini-composer" onSubmit={handleSubmit}>
        <input
          className="mini-composer-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t('chat.placeholder')}
          disabled={sending}
        />
        <button type="submit" className="circle-btn circle-btn-ink circle-btn-sm" disabled={sending} aria-label={t('common.save')}>
          <SendIcon size={12} />
        </button>
      </form>
    </div>
  );
};
