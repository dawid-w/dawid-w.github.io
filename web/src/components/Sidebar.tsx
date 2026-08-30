import React from 'react';
import { AppView } from '../types';
import { useT } from '../i18n';
import { useAppStore } from '../services/store';
import { PlusIcon, ChatIcon, TasksIcon, CalendarIcon, NotesIcon, VoiceIcon, GearIcon } from './Icons';
import { Avatar } from './Atoms';

interface SidebarProps {
  view: AppView;
  onNavigate: (view: AppView) => void;
  onOpenVoice: () => void;
}

// Note: the design spec's "Recent conversations" list assumes a multi-thread chat model
// (separate named conversations to browse) — the real app only ever has a single
// continuous message thread per account, no conversation/thread concept at all. Rather
// than fabricate example conversation titles with nothing real behind them, that list is
// left out entirely (see the plan's reconciliation notes). "New conversation" maps to the
// one real equivalent capability that exists: clearing the current thread.
export const Sidebar: React.FC<SidebarProps> = ({ view, onNavigate, onOpenVoice }) => {
  const t = useT();
  const user = useAppStore((s) => s.user);
  const clearMessages = useAppStore((s) => s.clearMessages);
  const tasks = useAppStore((s) => s.tasks);
  const activeTaskCount = tasks.filter((task) => task.status !== 'done').length;

  const initials = (user?.user_metadata?.full_name || user?.email || '?')
    .split(' ')
    .map((p: string) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const handleNewChat = () => {
    clearMessages();
    onNavigate('chat');
  };

  return (
    <aside className="sidebar">
      <div className="brand-row">
        <img className="brand-mark" src="/app-icon-6a-60.png" alt="Grimo AI" width={26} height={26} />
        <span className="brand-word">{t('nav.brand')}</span>
      </div>

      <div className="new-chat-wrap">
        <button className="new-chat-btn" onClick={handleNewChat}>
          <PlusIcon size={15} color="#fff" strokeWidth={2.2} />
          {t('nav.newChat')}
        </button>
      </div>

      <nav className="nav-group">
        <button className={`nav-row${view === 'chat' ? ' active' : ''}`} onClick={() => onNavigate('chat')}>
          <ChatIcon size={18} />
          {t('nav.chat')}
        </button>
        <button className={`nav-row${view === 'tasks' ? ' active' : ''}`} onClick={() => onNavigate('tasks')}>
          <TasksIcon size={18} />
          {t('nav.tasks')}
          {activeTaskCount > 0 && <span className="nav-count">{activeTaskCount}</span>}
        </button>
        <button className={`nav-row${view === 'cal' ? ' active' : ''}`} onClick={() => onNavigate('cal')}>
          <CalendarIcon size={18} />
          {t('nav.cal')}
        </button>
        <button className={`nav-row${view === 'notes' ? ' active' : ''}`} onClick={() => onNavigate('notes')}>
          <NotesIcon size={18} />
          {t('nav.notes')}
        </button>
        <button className="nav-row" onClick={onOpenVoice}>
          <VoiceIcon size={18} />
          {t('nav.voice')}
          <span className="keycap">⌘K</span>
        </button>
      </nav>

      <div style={{ flex: 1 }} />

      <button className={`account-row${view === 'settings' ? ' active' : ''}`} onClick={() => onNavigate('settings')}>
        <Avatar initials={initials || 'U'} />
        <div>
          <div className="account-name">{user?.user_metadata?.full_name || user?.email || ''}</div>
          <div className="account-sub">{t('nav.settings')}</div>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <GearIcon size={16} />
        </div>
      </button>
    </aside>
  );
};
