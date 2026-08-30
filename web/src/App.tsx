import React, { useEffect, useState } from 'react';
import { supabase } from './services/supabaseClient';
import { useAppStore } from './services/store';
import { Sidebar } from './components/Sidebar';
import { VoiceOverlay } from './components/VoiceOverlay';
import { AuthScreen } from './views/AuthScreen';
import { ChatView } from './views/ChatView';
import { TasksView } from './views/TasksView';
import { CalendarView } from './views/CalendarView';
import { NotesView } from './views/NotesView';
import { SettingsView } from './views/SettingsView';
import { AppView } from './types';

export default function App() {
  const user = useAppStore((s) => s.user);
  const authLoading = useAppStore((s) => s.authLoading);
  const setUser = useAppStore((s) => s.setUser);
  const setAuthLoading = useAppStore((s) => s.setAuthLoading);
  const fetchUserData = useAppStore((s) => s.fetchUserData);

  const [view, setView] = useState<AppView>('chat');
  const [voiceOpen, setVoiceOpen] = useState(false);

  // Restore session + subscribe to auth changes, same shape as App.tsx in the mobile app.
  useEffect(() => {
    let cancelled = false;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (cancelled) return;
      setUser(session?.user ?? null);
      setAuthLoading(false);
      if (session?.user) fetchUserData();
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchUserData();
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Background sync, same 10s cadence as mobile.
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => fetchUserData(), 10000);
    return () => clearInterval(interval);
  }, [user, fetchUserData]);

  // "⌘K / Ctrl+K → open voice overlay. Esc → close it."
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setVoiceOpen(true);
      } else if (e.key === 'Escape') {
        setVoiceOpen((open) => (open ? false : open));
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // "Changing view closes the voice overlay."
  const handleNavigate = (next: AppView) => {
    setView(next);
    setVoiceOpen(false);
  };

  // Chat action cards ("Open in calendar" etc.) dispatch this to jump views without each
  // view needing its own navigation prop-drilled down from App.
  useEffect(() => {
    const handler = (e: Event) => handleNavigate((e as CustomEvent).detail as AppView);
    window.addEventListener('grimo:navigate', handler);
    return () => window.removeEventListener('grimo:navigate', handler);
  }, []);

  if (authLoading) {
    return <div className="frame" />;
  }

  if (!user) {
    return <AuthScreen />;
  }

  return (
    <div className="frame">
      <Sidebar view={view} onNavigate={handleNavigate} onOpenVoice={() => setVoiceOpen(true)} />
      <div className="main">
        {view === 'chat' && <ChatView onOpenVoice={() => setVoiceOpen(true)} />}
        {view === 'tasks' && <TasksView />}
        {view === 'cal' && <CalendarView />}
        {view === 'notes' && <NotesView />}
        {view === 'settings' && <SettingsView />}
      </div>
      {voiceOpen && <VoiceOverlay onClose={() => setVoiceOpen(false)} />}
    </div>
  );
}
