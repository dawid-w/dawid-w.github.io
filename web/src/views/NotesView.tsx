import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useT } from '../i18n';
import { useAppStore } from '../services/store';
import { SearchIcon, PlusIcon } from '../components/Icons';

const EMPTY_NOTE_REMOVE_DELAY = 220;

export const NotesView: React.FC = () => {
  const t = useT();
  const notes = useAppStore((s) => s.notes);
  const addNote = useAppStore((s) => s.addNote);
  const updateNote = useAppStore((s) => s.updateNote);
  const removeNote = useAppStore((s) => s.removeNote);

  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const sorted = [...notes].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    if (!q) return sorted;
    return sorted.filter((n) => n.content.toLowerCase().includes(q));
  }, [notes, query]);

  const selected = notes.find((n) => n.id === selectedId) || null;

  // Leaving a blank note behind (created it, then jumped to another one without typing
  // anything) would otherwise litter the list with empty rows — fade it out and drop it
  // instead, same as if it had never been created.
  const selectedRef = useRef(selected);
  selectedRef.current = selected;
  useEffect(() => {
    return () => {
      const note = selectedRef.current;
      if (note && note.content.trim() === '') removeNote(note.id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const switchTo = (nextId: string) => {
    if (selected && selected.id !== nextId && selected.content.trim() === '') {
      const emptyId = selected.id;
      setRemovingId(emptyId);
      window.setTimeout(() => {
        removeNote(emptyId);
        setRemovingId((cur) => (cur === emptyId ? null : cur));
      }, EMPTY_NOTE_REMOVE_DELAY);
    }
    setSelectedId(nextId);
  };

  const handleNewNote = () => {
    const note = addNote({ content: '' });
    switchTo(note.id);
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
                <button
                  key={note.id}
                  className={`note-row${selectedId === note.id ? ' selected' : ''}${removingId === note.id ? ' removing' : ''}`}
                  onClick={() => switchTo(note.id)}
                >
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
                className="pill pill-danger"
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
