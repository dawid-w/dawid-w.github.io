import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useT } from '../i18n';
import { useAppStore } from '../services/store';
import { Task } from '../types';
import { PlusIcon } from '../components/Icons';

type Priority = Task['priority'];
const PRIORITY_ORDER: Priority[] = ['high', 'medium', 'low'];

interface TaskDraft {
  title: string;
  category: string;
  priority: Priority;
}

export const TasksView: React.FC = () => {
  const t = useT();
  const tasks = useAppStore((s) => s.tasks);
  const updateTask = useAppStore((s) => s.updateTask);
  const removeTask = useAppStore((s) => s.removeTask);
  const addTask = useAppStore((s) => s.addTask);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  // A new task stays a local draft — never added to the real list — until Save.
  const [draft, setDraft] = useState<TaskDraft | null>(null);
  const rowRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  const selectTask = (id: string) => {
    setDraft(null);
    setSelectedId(id);
  };

  // Chat's "to do" list (and action cards) jump here with a specific task in mind.
  useEffect(() => {
    const handler = (e: Event) => selectTask((e as CustomEvent<string>).detail);
    window.addEventListener('grimo:selectTask', handler);
    return () => window.removeEventListener('grimo:selectTask', handler);
  }, []);

  // Keep the selected row in view — including right after saving a new task, so the
  // user lands on where it ended up in the (category-grouped) list.
  useEffect(() => {
    if (!selectedId) return;
    rowRefs.current.get(selectedId)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [selectedId]);

  // Done tasks are hidden entirely — marking a task done behaves like deleting it
  // from this view, not moving it to a separate completed list.
  const filtered = useMemo(() => tasks.filter((task) => task.status !== 'done'), [tasks]);

  // Grouped by category, matching mobile — priority stays a per-task field, not a
  // grouping axis.
  const groups = useMemo(() => {
    const byCategory = new Map<string, Task[]>();
    for (const task of filtered) {
      const key = task.category.trim();
      const arr = byCategory.get(key);
      if (arr) arr.push(task);
      else byCategory.set(key, [task]);
    }
    const priorityRank: Record<Priority, number> = { high: 0, medium: 1, low: 2 };
    const categories = Array.from(byCategory.keys()).sort((a, b) => {
      if (!a) return 1;
      if (!b) return -1;
      return a.localeCompare(b);
    });
    return categories.map((category) => ({
      category,
      items: byCategory.get(category)!.sort((a, b) => priorityRank[a.priority] - priorityRank[b.priority]),
    }));
  }, [filtered]);

  const selected = filtered.find((task) => task.id === selectedId) || null;

  const markDone = (task: Task) => {
    updateTask(task.id, { status: 'done' });
  };

  const handleNewTask = () => {
    setSelectedId(null);
    setDraft({ title: '', category: '', priority: 'medium' });
  };

  const handleSaveDraft = () => {
    if (!draft) return;
    const newTask = addTask({ title: draft.title.trim(), category: draft.category.trim(), status: 'todo', priority: draft.priority });
    setDraft(null);
    setSelectedId(newTask.id);
  };

  const priorityLabel = (p: Priority) => t(`tasks.priority${p.charAt(0).toUpperCase()}${p.slice(1)}`);

  return (
    <>
      <div className="topbar">
        <span className="view-title">{t('tasks.title')}</span>
        <div className="topbar-right">
          <button className="pill pill-ink" onClick={handleNewTask}>
            <PlusIcon size={13} color="#fff" strokeWidth={2.2} />
            {t('tasks.newTask')}
          </button>
        </div>
      </div>

      <div className="main-body">
        <div className="task-list-col">
          {groups.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-title">{t('tasks.noTasks')}</div>
            </div>
          ) : (
            groups.map((group) => (
              <div key={group.category || '__uncategorized'} className="task-group">
                <div className="task-group-head">
                  <span>{(group.category || t('tasks.uncategorized')).toUpperCase()}</span>
                  <span className="task-group-count">{group.items.length}</span>
                </div>
                <div className="task-rows">
                  {group.items.map((task) => (
                    <button
                      key={task.id}
                      ref={(el) => {
                        if (el) rowRefs.current.set(task.id, el);
                        else rowRefs.current.delete(task.id);
                      }}
                      className={`task-row${selectedId === task.id ? ' selected' : ''}`}
                      onClick={() => selectTask(task.id)}
                    >
                      <div className="task-row-body">
                        <div className="task-row-title">{task.title || t('tasks.titlePlaceholder')}</div>
                        {task.category && <div className="task-row-meta">{task.category}</div>}
                      </div>
                      {task.category && <span className="tag-chip tag-neutral">{task.category.toUpperCase()}</span>}
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="detail-panel">
          {draft ? (
            <>
              <div className="context-label">{t('tasks.details')}</div>
              <input
                className="detail-title-input"
                value={draft.title}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                placeholder={t('tasks.titlePlaceholder')}
                autoFocus
              />

              <div className="detail-row">
                <span className="detail-label">{t('tasks.priority')}</span>
                <div className="segmented">
                  {PRIORITY_ORDER.map((p) => (
                    <button key={p} className={draft.priority === p ? 'active' : ''} onClick={() => setDraft({ ...draft, priority: p })}>
                      {priorityLabel(p)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="detail-row">
                <span className="detail-label">{t('tasks.categoryPlaceholder')}</span>
                <input
                  className="detail-inline-input"
                  value={draft.category}
                  onChange={(e) => setDraft({ ...draft, category: e.target.value })}
                  placeholder={t('tasks.categoryPlaceholder')}
                />
              </div>

              <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
                <button className="pill pill-ink" onClick={handleSaveDraft}>
                  {t('common.save')}
                </button>
                <button className="pill pill-ghost" onClick={() => setDraft(null)}>
                  {t('common.cancel')}
                </button>
              </div>
            </>
          ) : !selected ? (
            <div className="empty-state">
              <div className="empty-state-body">{t('tasks.selectTask')}</div>
            </div>
          ) : (
            <>
              <div className="context-label">{t('tasks.details')}</div>
              <input
                className="detail-title-input"
                value={selected.title}
                onChange={(e) => updateTask(selected.id, { title: e.target.value })}
                placeholder={t('tasks.titlePlaceholder')}
              />

              <div className="detail-row">
                <span className="detail-label">{t('tasks.priority')}</span>
                <div className="segmented">
                  {PRIORITY_ORDER.map((p) => (
                    <button key={p} className={selected.priority === p ? 'active' : ''} onClick={() => updateTask(selected.id, { priority: p })}>
                      {priorityLabel(p)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="detail-row">
                <span className="detail-label">{t('tasks.categoryPlaceholder')}</span>
                <input
                  className="detail-inline-input"
                  value={selected.category}
                  onChange={(e) => updateTask(selected.id, { category: e.target.value })}
                  placeholder={t('tasks.categoryPlaceholder')}
                />
              </div>

              <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
                <button className="pill pill-ink" onClick={() => markDone(selected)}>
                  {t('tasks.markDone')}
                </button>
                <button
                  className="pill pill-danger"
                  onClick={() => {
                    if (window.confirm(t('tasks.deleteConfirm'))) {
                      removeTask(selected.id);
                      setSelectedId(null);
                    }
                  }}
                >
                  {t('common.delete')}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};
