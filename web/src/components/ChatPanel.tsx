import React, { useEffect, useRef, useState } from 'react';
import { useT } from '../i18n';
import { useAppStore } from '../services/store';
import { sendChatMessage } from '../services/ai';
import { Message } from '../types';
import { SendIcon } from './Icons';

// Compact chat, embeddable in a side panel — shares the same message thread as the
// main Chat tab (same store), so a message sent here shows up there too.
export const ChatPanel: React.FC = () => {
  const t = useT();
  const messages = useAppStore((s) => s.messages);
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
    setSending(true);
    try {
      await sendChatMessage(trimmed);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mini-chat">
      <div className="context-label">{t('chat.title')}</div>
      <div className="mini-chat-thread" ref={threadRef}>
        {messages.filter((m) => m.role !== 'system').length === 0 && !sending ? (
          <div className="context-empty">{t('chat.emptyBody')}</div>
        ) : (
          messages
            .filter((m) => m.role !== 'system')
            .map((m: Message) => (
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
