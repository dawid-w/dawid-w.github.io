import React from 'react';

export const Checkbox: React.FC<{ checked: boolean; onChange: () => void; ariaLabel?: string }> = ({ checked, onChange, ariaLabel }) => (
  <button className={`checkbox${checked ? ' checked' : ''}`} onClick={onChange} aria-label={ariaLabel} aria-pressed={checked}>
    {checked && (
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 6 9 17l-5-5" />
      </svg>
    )}
  </button>
);

export const Toggle: React.FC<{ on: boolean; onChange: () => void; ariaLabel?: string }> = ({ on, onChange, ariaLabel }) => (
  <button className={`toggle${on ? ' on' : ''}`} onClick={onChange} aria-label={ariaLabel} aria-pressed={on}>
    <span className="knob" />
  </button>
);

export const Avatar: React.FC<{ initials: string; size?: number }> = ({ initials, size = 30 }) => (
  <span className="avatar" style={{ width: size, height: size, fontSize: size * 0.42 }}>
    {initials}
  </span>
);
