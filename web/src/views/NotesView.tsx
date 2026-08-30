import React, { useMemo, useState } from 'react';
import { useT } from '../i18n';
import { useAppStore } from '../services/store';
import { SearchIcon, PlusIcon } from '../components/Icons';

export const NotesView: React.FC = () => {
  const t = useT();
  const notes = useAppStore((s) => s.notes);
  const addNote = useAppStore((s) => s.addNote);
  const updateNote = useAppStore((s) => s.updateNote);
  const removeNote = useAppStore((s) => s.removeNote);

  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const sorted = [...notes].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    if (!q) return sorted;
    return sorted.filter((n) => n.content.toLowerCase().includes(q));
  }, [notes, query]);

  const selected = notes.find((n) => n.id === selectedId) || null;

  const handleNewNote = () => {
    const note = addNote({ content: '' });
    setSelectedId(note.id);
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString(document.documentElement.lang || 'en', { day: 'numeric', month: 'short' });

  return (
    <>
      <div className="topbar">
        <span className="view-title">{t('notes.title')}</span>
        <div className="search-field">
          <SearchIcon size={15} color="#9C9C99" strokeWidth={1.7} />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t('notes.search')} />
        </div>
        <div className="topbar-right">
          <button className="pill pill-ink" onClick={handleNewNote}>
            <PlusIcon size={13} color="#fff" strokeWidth={2.2} />
            {t('notes.newNote')}
          </button>
        </div>
      </div>

      <div className="main-body">
        <div className="notes-list-col">
          {filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-title">{t('notes.noNotes')}</div>
            </div>
          ) : (
            filtered.map((note) => {
              const firstLine = note.content.split('\n')[0] || t('notes.placeholder');
              const snippet = note.content.split('\n').slice(1).join(' ');
              return (
                <button key={note.id} className={`note-row${selectedId === note.id ? ' selected' : ''}`} onClick={() => setSelectedId(note.id)}>
                  <div className="note-row-top">
                    <span className="note-row-title">{firstLine}</span>
                    <span className="note-row-date">{formatDate(note.createdAt)}</span>
                  </div>
                  {snippet && <div className="note-row-snippet">{snippet}</div>}
                </button>
              );
            })
          )}
        </div>

        <div className="note-open-col">
          {!selected ? (
            <div className="empty-state">
              <div className="empty-state-body">{t('notes.selectNote')}</div>
            </div>
          ) : (
            <div className="note-open-inner">
              <textarea
                className="note-editor"
                value={selected.content}
                onChange={(e) => updateNote(selected.id, { content: e.target.value })}
                placeholder={t('notes.placeholder')}
                autoFocus={selected.content === ''}
              />
              <button
                className="pill pill-ghost"
                onClick={() => {
                  if (window.confirm(t('notes.deleteConfirm'))) {
                    removeNote(selected.id);
                    setSelectedId(null);
                  }
                }}
              >
                {t('common.delete')}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
