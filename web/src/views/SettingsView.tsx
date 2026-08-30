import React from 'react';
import { useT } from '../i18n';
import { useLanguage, setLanguage } from '../i18n/languageStore';
import { useAppStore } from '../services/store';
import { signOut } from '../services/authService';
import { AppLanguage } from '../types';
import { Avatar } from '../components/Atoms';

const LANGUAGES: { code: AppLanguage; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'pl', label: 'Polski' },
  { code: 'de', label: 'Deutsch' },
];

export const SettingsView: React.FC = () => {
  const t = useT();
  const language = useLanguage();
  const user = useAppStore((s) => s.user);
  const plan = useAppStore((s) => s.plan);

  const email: string = user?.email || '';
  const fullName: string = user?.user_metadata?.full_name || user?.user_metadata?.name || '';
  const initials = (fullName || email || '?')
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('') || '?';

  const handleLogout = () => {
    if (window.confirm(t('settings.logout') + '?')) {
      void signOut();
    }
  };

  return (
    <>
      <div className="topbar">
        <span className="view-title">{t('settings.title')}</span>
      </div>

      <div className="main-body settings-body">
        <div className="settings-col">
          <section className="settings-section">
            <div className="settings-section-label">{t('settings.account')}</div>
            <div className="settings-card">
              <div className="settings-account-row">
                <Avatar initials={initials} size={44} />
                <div className="settings-account-info">
                  <div className="settings-account-name">{fullName || email}</div>
                  {fullName && <div className="settings-account-email">{email}</div>}
                </div>
              </div>
              <div className="settings-row">
                <span className="settings-row-label">{t('settings.google')}</span>
                <span className="tag-green">{t('settings.googleConnected')}</span>
              </div>
              <div className="settings-row">
                <span className="settings-row-label">{t('settings.plan')}</span>
                <span className="tag-neutral">{plan === 'paid' ? t('settings.planPro') : t('settings.planFree')}</span>
              </div>
              <div className="settings-manage-hint">{t('settings.manageInMobile')}</div>
            </div>
          </section>

          <section className="settings-section">
            <div className="settings-section-label">{t('settings.language')}</div>
            <div className="settings-card">
              <div className="settings-row settings-row-top">
                <div>
                  <div className="settings-row-label">{t('settings.language_label')}</div>
                  <div className="settings-row-desc">{t('settings.language_desc')}</div>
                </div>
              </div>
              <div className="settings-lang-options">
                {LANGUAGES.map((l) => (
                  <button
                    key={l.code}
                    className={`settings-lang-opt${language === l.code ? ' selected' : ''}`}
                    onClick={() => setLanguage(l.code)}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>
          </section>

          <button className="pill pill-ghost settings-logout-btn" onClick={handleLogout}>
            {t('settings.logout')}
          </button>
        </div>
      </div>
    </>
  );
};
