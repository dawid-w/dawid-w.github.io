import React, { useState } from 'react';
import { useT } from '../i18n';
import { signInWithGoogle } from '../services/authService';

export const AuthScreen: React.FC = () => {
  const t = useT();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogle = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithGoogle();
      // Browser navigates away to Google's OAuth screen here; nothing else to do —
      // App.tsx's onAuthStateChange picks up the session on redirect back.
    } catch (err) {
      console.error('signInWithGoogle failed:', err);
      setError(t('auth.error'));
      setLoading(false);
    }
  };

  return (
    <div className="frame auth-frame">
      <div className="auth-card ob-up">
        <span className="brand-mark auth-mark">
          <span className="auth-plus">+</span>
        </span>
        <h1 className="auth-title">{t('auth.title')}</h1>
        <p className="auth-subtitle">{t('auth.subtitle')}</p>

        <button className="google-btn" onClick={handleGoogle} disabled={loading}>
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path
              fill="#FFC107"
              d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l5.7-5.7C34.6 6.1 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z"
            />
            <path
              fill="#FF3D00"
              d="m6.3 14.7 6.6 4.8C14.7 15.9 19 13 24 13c3.1 0 5.8 1.1 8 3l5.7-5.7C34.6 6.1 29.6 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
            />
            <path
              fill="#4CAF50"
              d="M24 44c5.5 0 10.5-2.1 14.3-5.6l-6.6-5.6C29.6 34.7 27 35.5 24 35.5c-5.3 0-9.6-3.4-11.2-8.1l-6.5 5C9.6 39.6 16.2 44 24 44z"
            />
            <path
              fill="#1976D2"
              d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.2 5.6l6.6 5.6C41.4 36.4 44 30.7 44 24c0-1.3-.1-2.7-.4-3.5z"
            />
          </svg>
          {loading ? t('auth.signingIn') : t('auth.continueWithGoogle')}
        </button>

        {error && <p className="auth-error">{error}</p>}
      </div>
    </div>
  );
};
