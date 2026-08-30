import { useSyncExternalStore } from 'react';
import { AppLanguage } from '../types';

const STORAGE_KEY = 'grimo_web_language_v1';

function detectDefault(): AppLanguage {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'en' || saved === 'pl' || saved === 'de') return saved;
  } catch {}
  const nav = (navigator.language || 'en').slice(0, 2);
  if (nav === 'pl' || nav === 'de') return nav;
  return 'en';
}

let language: AppLanguage = detectDefault();
const listeners = new Set<() => void>();

// Kept in sync so anything reading document.documentElement.lang directly (date
// formatting via toLocaleDateString, Web Speech API recognition.lang fallbacks) picks up
// the user's actual selection instead of the static index.html default.
document.documentElement.lang = language;

export function getLanguage(): AppLanguage {
  return language;
}

export function setLanguage(next: AppLanguage) {
  language = next;
  document.documentElement.lang = next;
  try {
    localStorage.setItem(STORAGE_KEY, next);
  } catch {}
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useLanguage(): AppLanguage {
  return useSyncExternalStore(subscribe, getLanguage);
}
