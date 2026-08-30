// Same dot-path lookup/interpolate mechanism as ../../../src/i18n/index.ts (mobile) —
// fresh dictionaries below, scoped to this app's own UI, not a copy-paste of mobile's keys.
import { AppLanguage } from '../types';
import { en } from './translations/en';
import { pl } from './translations/pl';
import { de } from './translations/de';
import { useLanguage } from './languageStore';

const DICTIONARIES: Record<AppLanguage, any> = { en, pl, de };

function lookup(dict: any, path: string): string | undefined {
  const value = path.split('.').reduce<any>((acc, part) => (acc && typeof acc === 'object' ? acc[part] : undefined), dict);
  return typeof value === 'string' ? value : undefined;
}

function interpolate(template: string, params?: Record<string, string | number>): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (match, key) => (key in params ? String(params[key]) : match));
}

export function translate(language: AppLanguage, key: string, params?: Record<string, string | number>): string {
  const primary = lookup(DICTIONARIES[language], key);
  if (primary !== undefined) return interpolate(primary, params);
  const fallback = lookup(DICTIONARIES.en, key);
  if (fallback !== undefined) return interpolate(fallback, params);
  return key;
}

export function useT() {
  const language = useLanguage();
  return (key: string, params?: Record<string, string | number>) => translate(language, key, params);
}
