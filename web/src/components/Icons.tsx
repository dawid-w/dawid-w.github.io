import React from 'react';

type IconProps = { size?: number; color?: string; strokeWidth?: number };
const base = (size = 18, color = '#1C1C1E', strokeWidth = 1.8) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none' as const,
  stroke: color,
  strokeWidth,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
});

export const PlusIcon: React.FC<IconProps> = ({ size, color, strokeWidth }) => (
  <svg {...base(size, color, strokeWidth)}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const ChatIcon: React.FC<IconProps> = ({ size, color, strokeWidth }) => (
  <svg {...base(size, color, strokeWidth)}>
    <path d="M21 12a8 8 0 1 1-3.6-6.66L21 4l-1 4.5A7.96 7.96 0 0 1 21 12Z" />
  </svg>
);

export const TasksIcon: React.FC<IconProps> = ({ size, color, strokeWidth }) => (
  <svg {...base(size, color, strokeWidth)}>
    <path d="M4 6.5 5.5 8 8 5" />
    <path d="M11 6h9" />
    <path d="M4 12.5 5.5 14 8 11" />
    <path d="M11 12h9" />
    <path d="M4 18.5 5.5 20 8 17" />
    <path d="M11 18h9" />
  </svg>
);

export const CalendarIcon: React.FC<IconProps> = ({ size, color, strokeWidth }) => (
  <svg {...base(size, color, strokeWidth)}>
    <rect x="3.5" y="5" width="17" height="16" rx="3" />
    <path d="M3.5 9.5h17" />
    <path d="M8 3v3M16 3v3" />
  </svg>
);

export const NotesIcon: React.FC<IconProps> = ({ size, color, strokeWidth }) => (
  <svg {...base(size, color, strokeWidth)}>
    <path d="m16.5 4.5 3 3L8 19l-4 1 1-4Z" />
  </svg>
);

export const VoiceIcon: React.FC<IconProps> = ({ size = 18, color = '#1C1C1E' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect x="3.5" y="9" width="2.6" height="8" rx="1.3" fill={color} />
    <rect x="9.2" y="4" width="2.6" height="18" rx="1.3" fill={color} />
    <rect x="14.9" y="7" width="2.6" height="12" rx="1.3" fill={color} />
    <rect x="20.6" y="10.5" width="2.6" height="5" rx="1.3" fill={color} />
  </svg>
);

export const SearchIcon: React.FC<IconProps> = ({ size, color, strokeWidth }) => (
  <svg {...base(size, color, strokeWidth)}>
    <circle cx="11" cy="11" r="7" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

export const MicIcon: React.FC<IconProps> = ({ size, color, strokeWidth }) => (
  <svg {...base(size, color, strokeWidth)}>
    <rect x="9" y="3" width="6" height="11" rx="3" />
    <path d="M5 11a7 7 0 0 0 14 0" />
    <path d="M12 18v3" />
  </svg>
);

export const MicMutedIcon: React.FC<IconProps> = ({ size, color, strokeWidth }) => (
  <svg {...base(size, color, strokeWidth)}>
    <rect x="9" y="3" width="6" height="11" rx="3" />
    <path d="M5 11a7 7 0 0 0 14 0" />
    <path d="M12 18v3" />
    <path d="M4 4 20 20" />
  </svg>
);

export const SendIcon: React.FC<IconProps> = ({ size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 19V5M5 12l7-7 7 7" />
  </svg>
);

export const ChevronLeftIcon: React.FC<IconProps> = ({ size, color, strokeWidth }) => (
  <svg {...base(size, color, strokeWidth)}>
    <path d="m15 18-6-6 6-6" />
  </svg>
);
export const ChevronRightIcon: React.FC<IconProps> = ({ size, color, strokeWidth }) => (
  <svg {...base(size, color, strokeWidth)}>
    <path d="m9 18 6-6-6-6" />
  </svg>
);
export const ChevronDownIcon: React.FC<IconProps> = ({ size = 13, color, strokeWidth }) => (
  <svg {...base(size, color, strokeWidth)}>
    <path d="m6 9 6 6 6-6" />
  </svg>
);

export const GearIcon: React.FC<IconProps> = ({ size, color, strokeWidth }) => (
  <svg {...base(size, color, strokeWidth)}>
    <circle cx="12" cy="12" r="3.3" />
    <path d="M19.4 13.5a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1 1.55V19.4a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1.1-1.55 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.7 1.7 0 0 0 .34-1.87 1.7 1.7 0 0 0-1.55-1H4.6a2 2 0 1 1 0-4h.09a1.7 1.7 0 0 0 1.55-1.1 1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.87.34H10a1.7 1.7 0 0 0 1-1.55V4.6a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1 1.55 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87V10a1.7 1.7 0 0 0 1.55 1h.09a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.55 1Z" />
  </svg>
);

export const XIcon: React.FC<IconProps> = ({ size, color, strokeWidth }) => (
  <svg {...base(size, color, strokeWidth)}>
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);

export const TrashIcon: React.FC<IconProps> = ({ size = 15, color, strokeWidth }) => (
  <svg {...base(size, color, strokeWidth)}>
    <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" />
  </svg>
);
