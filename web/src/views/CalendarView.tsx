import React, { useMemo, useState } from 'react';
import { useT } from '../i18n';
import { useAppStore } from '../services/store';
import { CalendarEvent, EventCategory } from '../types';
import { getCategoryStyle } from '../constants/eventCategories';
import { assignEventColorVariants } from '../utils/calendarColorVariants';
import { ChatPanel } from '../components/ChatPanel';
import { ChevronLeftIcon, ChevronRightIcon } from '../components/Icons';

type CalMode = 'week' | 'month';
const CATEGORY_LABEL_KEY: Record<EventCategory, string> = {
  travel: 'calendar.categoryTravel',
  training: 'calendar.categoryTraining',
  meeting: 'calendar.categoryMeeting',
  vacation: 'calendar.categoryVacation',
  internal: 'calendar.categoryInternal',
};
const WEEKDAY_KEYS = ['weekdayMon', 'weekdayTue', 'weekdayWed', 'weekdayThu', 'weekdayFri', 'weekdaySat', 'weekdaySun'];
const HOUR_START = 8;
const HOUR_END = 18; // exclusive — renders 8:00..17:00 gutter labels, matches the spec
const HOUR_HEIGHT = 62;

function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
// new Date("YYYY-MM-DD") parses as UTC midnight, not local — a classic off-by-one-day trap
// depending on the browser's timezone. Explicit local construction avoids it, same pattern
// mobile's screens use (e.g. EventDetailScreen's parseDateStr).
function parseDateStr(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}
function startOfWeek(d: Date): Date {
  const day = d.getDay(); // 0 = Sunday
  const diff = day === 0 ? -6 : 1 - day; // Monday-start week
  const start = new Date(d);
  start.setDate(d.getDate() + diff);
  start.setHours(0, 0, 0, 0);
  return start;
}
function addDays(d: Date, n: number): Date {
  const next = new Date(d);
  next.setDate(d.getDate() + n);
  return next;
}
function timeToHourFraction(time?: string): number {
  if (!time) return HOUR_START;
  const [h, m] = time.split(':').map(Number);
  return h + m / 60;
}

export const CalendarView: React.FC = () => {
  const t = useT();
  const events = useAppStore((s) => s.events);
  const updateEvent = useAppStore((s) => s.updateEvent);
  const removeEvent = useAppStore((s) => s.removeEvent);
  const [mode, setMode] = useState<CalMode>('month');
  const [anchor, setAnchor] = useState(() => new Date());
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const todayStr = toDateStr(new Date());
  const colorVariants = useMemo(() => assignEventColorVariants(events), [events]);
  const selected = events.find((ev) => ev.id === selectedId) || null;

  const goPrev = () => setAnchor((d) => (mode === 'week' ? addDays(d, -7) : new Date(d.getFullYear(), d.getMonth() - 1, 1)));
  const goNext = () => setAnchor((d) => (mode === 'week' ? addDays(d, 7) : new Date(d.getFullYear(), d.getMonth() + 1, 1)));
  const goToday = () => setAnchor(new Date());

  const monthLabel = anchor.toLocaleDateString(document.documentElement.lang || 'en', { month: 'long', year: 'numeric' });

  return (
    <>
      <div className="topbar">
        <span className="view-title">{mode === 'month' ? monthLabel.replace(/^\w/, (c) => c.toUpperCase()) : t('calendar.title')}</span>
        <button className="icon-btn" style={{ borderRadius: 9, width: 28, height: 28 }} onClick={goPrev} aria-label="prev">
          <ChevronLeftIcon size={14} color="#1C1C1E" strokeWidth={1.8} />
        </button>
        <button className="icon-btn" style={{ borderRadius: 9, width: 28, height: 28 }} onClick={goNext} aria-label="next">
          <ChevronRightIcon size={14} color="#1C1C1E" strokeWidth={1.8} />
        </button>
        <button className="pill" onClick={goToday}>
          {t('calendar.todayBtn')}
        </button>
        <div className="topbar-right">
          <div className="segmented">
            <button className={mode === 'week' ? 'active' : ''} onClick={() => setMode('week')}>
              {t('calendar.week')}
            </button>
            <button className={mode === 'month' ? 'active' : ''} onClick={() => setMode('month')}>
              {t('calendar.month')}
            </button>
          </div>
        </div>
      </div>

      <div className="main-body">
        {mode === 'week' ? (
          <WeekGrid
            anchor={anchor}
            events={events}
            todayStr={todayStr}
            colorVariants={colorVariants}
            weekdayLabel={(i) => t(`calendar.${WEEKDAY_KEYS[i]}`)}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        ) : (
          <MonthGrid
            anchor={anchor}
            events={events}
            todayStr={todayStr}
            colorVariants={colorVariants}
            moreLabel={(n) => t('calendar.moreEvents', { count: n })}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        )}

        <div className="cal-right-panel">
          <div className="cal-event-detail">
            {!selected ? (
              <div className="empty-state">
                <div className="empty-state-body">{t('calendar.selectEvent')}</div>
              </div>
            ) : (
              <>
                <div className="context-label">{t('calendar.eventDetails')}</div>
                <input
                  className="detail-title-input"
                  value={selected.title}
                  onChange={(e) => updateEvent(selected.id, { title: e.target.value })}
                  placeholder={t('calendar.titlePlaceholder')}
                />

                <div className="detail-row">
                  <span className="detail-label">{t('calendar.date')}</span>
                  <input
                    type="date"
                    className="detail-inline-input"
                    value={selected.date}
                    onChange={(e) => updateEvent(selected.id, { date: e.target.value })}
                  />
                </div>

                <div className="detail-row">
                  <span className="detail-label">{t('calendar.time')}</span>
                  <input
                    type="time"
                    className="detail-inline-input"
                    value={selected.time || ''}
                    onChange={(e) => updateEvent(selected.id, { time: e.target.value || undefined })}
                  />
                </div>

                <div className="detail-row">
                  <span className="detail-label">{t('calendar.endTime')}</span>
                  <input
                    type="time"
                    className="detail-inline-input"
                    value={selected.endTime || ''}
                    onChange={(e) => updateEvent(selected.id, { endTime: e.target.value || undefined })}
                  />
                </div>

                <div className="detail-row">
                  <span className="detail-label">{t('calendar.location')}</span>
                  <input
                    className="detail-inline-input"
                    value={selected.location || ''}
                    onChange={(e) => updateEvent(selected.id, { location: e.target.value || undefined })}
                    placeholder={t('calendar.location')}
                  />
                </div>

                <div className="detail-row" style={{ border: 'none' }}>
                  <span className="detail-label">{t('calendar.category')}</span>
                  <span
                    className="tag-chip"
                    style={{ background: getCategoryStyle(selected.category, 0).bg, color: getCategoryStyle(selected.category, 0).text }}
                  >
                    {t(CATEGORY_LABEL_KEY[selected.category || 'internal']).toUpperCase()}
                  </span>
                </div>

                <button
                  className="pill pill-danger"
                  style={{ marginTop: 16, alignSelf: 'flex-start' }}
                  onClick={() => {
                    if (window.confirm(t('calendar.deleteConfirm'))) {
                      removeEvent(selected.id);
                      setSelectedId(null);
                    }
                  }}
                >
                  {t('common.delete')}
                </button>
              </>
            )}
          </div>

          <div className="cal-panel-divider" />

          <div className="cal-chat-half">
            <ChatPanel />
          </div>
        </div>
      </div>
    </>
  );
};

const MONTH_MAX_LANES = 3;
const MONTH_BAR_TOP = 32; // below the day-number badge
const MONTH_BAR_HEIGHT = 17;
const MONTH_BAR_GAP = 2;

interface WeekBar {
  event: CalendarEvent;
  startCol: number; // 0-6, inclusive
  endCol: number; // 0-6, inclusive
  lane: number;
}

// Greedy interval-graph coloring: events spanning multiple days get one continuous bar
// per week (clipped to that week), stacked into lanes so overlapping events don't
// collide. Events beyond MONTH_MAX_LANES fall back to a per-day "+n more" count.
function computeWeekBars(weekStart: Date, events: CalendarEvent[]): { bars: WeekBar[]; overflowByDay: number[] } {
  const weekStartStr = toDateStr(weekStart);
  const weekEndStr = toDateStr(addDays(weekStart, 6));

  const spans = events
    .map((event) => {
      const end = event.endDate && event.endDate > event.date ? event.endDate : event.date;
      if (end < weekStartStr || event.date > weekEndStr) return null;
      const clippedStart = event.date < weekStartStr ? weekStartStr : event.date;
      const clippedEnd = end > weekEndStr ? weekEndStr : end;
      const startCol = Math.round((parseDateStr(clippedStart).getTime() - weekStart.getTime()) / 86400000);
      const endCol = Math.round((parseDateStr(clippedEnd).getTime() - weekStart.getTime()) / 86400000);
      return { event, startCol, endCol };
    })
    .filter((s): s is { event: CalendarEvent; startCol: number; endCol: number } => s !== null)
    .sort((a, b) => a.startCol - b.startCol || b.endCol - b.startCol - (a.endCol - a.startCol) || (a.event.time || '').localeCompare(b.event.time || ''));

  const laneEndCols: number[] = [];
  const bars: WeekBar[] = [];
  const overflowByDay = new Array(7).fill(0);

  for (const span of spans) {
    let lane = laneEndCols.findIndex((endCol) => endCol < span.startCol);
    if (lane === -1) lane = laneEndCols.length;
    if (lane >= MONTH_MAX_LANES) {
      for (let d = span.startCol; d <= span.endCol; d++) overflowByDay[d]++;
      continue;
    }
    laneEndCols[lane] = span.endCol;
    bars.push({ ...span, lane });
  }

  return { bars, overflowByDay };
}

const MonthGrid: React.FC<{
  anchor: Date;
  events: CalendarEvent[];
  todayStr: string;
  colorVariants: Map<string, number>;
  moreLabel: (n: number) => string;
  selectedId: string | null;
  onSelect: (id: string) => void;
}> = ({ anchor, events, todayStr, colorVariants, moreLabel, selectedId, onSelect }) => {
  const t = useT();
  const year = anchor.getFullYear();
  const month = anchor.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  const gridStart = startOfWeek(firstOfMonth);
  const weeks = useMemo(() => Array.from({ length: 6 }, (_, w) => addDays(gridStart, w * 7)), [gridStart]);

  return (
    <div className="month-grid">
      {weeks.map((weekStart, w) => {
        const { bars, overflowByDay } = computeWeekBars(weekStart, events);
        return (
          <div key={w} className="month-week-row">
            {Array.from({ length: 7 }, (_, d) => {
              const day = addDays(weekStart, d);
              const key = toDateStr(day);
              const inMonth = day.getMonth() === month;
              return (
                <div key={d} className={`month-daycell${inMonth ? '' : ' outside'}`}>
                  <div className={`month-daynum${key === todayStr ? ' today' : ''}`}>{day.getDate()}</div>
                </div>
              );
            })}
            <div className="month-week-bars">
              {bars.map(({ event, startCol, endCol, lane }) => {
                const style = getCategoryStyle(event.category, colorVariants.get(event.id) ?? 0);
                return (
                  <button
                    key={event.id}
                    className={`month-bar${selectedId === event.id ? ' selected' : ''}`}
                    style={{
                      left: `${(startCol / 7) * 100}%`,
                      width: `${((endCol - startCol + 1) / 7) * 100}%`,
                      top: MONTH_BAR_TOP + lane * (MONTH_BAR_HEIGHT + MONTH_BAR_GAP),
                      background: style.bg,
                      borderLeftColor: style.rail,
                      color: style.text,
                    }}
                    onClick={() => onSelect(event.id)}
                  >
                    {event.title}
                  </button>
                );
              })}
              {overflowByDay.map((count, d) =>
                count > 0 ? (
                  <div
                    key={d}
                    className="month-bar-overflow"
                    style={{
                      left: `${(d / 7) * 100}%`,
                      width: `${(1 / 7) * 100}%`,
                      top: MONTH_BAR_TOP + MONTH_MAX_LANES * (MONTH_BAR_HEIGHT + MONTH_BAR_GAP),
                    }}
                  >
                    {moreLabel(count)}
                  </div>
                ) : null
              )}
            </div>
          </div>
        );
      })}
      {events.length === 0 && <div className="empty-state">{t('calendar.noEvents')}</div>}
    </div>
  );
};

const WeekGrid: React.FC<{
  anchor: Date;
  events: CalendarEvent[];
  todayStr: string;
  colorVariants: Map<string, number>;
  weekdayLabel: (i: number) => string;
  selectedId: string | null;
  onSelect: (id: string) => void;
}> = ({ anchor, events, todayStr, colorVariants, weekdayLabel, selectedId, onSelect }) => {
  const weekStart = startOfWeek(anchor);
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const hours = Array.from({ length: HOUR_END - HOUR_START }, (_, i) => HOUR_START + i);

  return (
    <div className="week-col">
      <div className="week-header">
        <div className="week-gutter-spacer" />
        {days.map((day, i) => {
          const key = toDateStr(day);
          return (
            <div key={i} className="week-day-head">
              <span className="week-weekday">{weekdayLabel(i)}</span>
              <span className={`week-datepill${key === todayStr ? ' today' : ''}`}>{day.getDate()}</span>
            </div>
          );
        })}
      </div>
      <div className="week-scroll">
        <div className="week-hour-gutter">
          {hours.map((h) => (
            <div key={h} className="week-hour-label" style={{ height: HOUR_HEIGHT }}>
              {String(h).padStart(2, '0')}:00
            </div>
          ))}
        </div>
        <div className="week-grid-body" style={{ height: hours.length * HOUR_HEIGHT }}>
          {hours.map((h, i) => (
            <div key={h} className="week-hour-line" style={{ top: i * HOUR_HEIGHT }} />
          ))}
          <div className="week-columns">
            {days.map((day, i) => {
              const key = toDateStr(day);
              const dayEvents = events.filter((ev) => ev.date === key || (ev.endDate && ev.date <= key && ev.endDate >= key));
              return (
                <div key={i} className="week-day-col">
                  {dayEvents.map((ev) => {
                    const startHour = timeToHourFraction(ev.time);
                    const endHour = ev.endTime ? timeToHourFraction(ev.endTime) : startHour + 0.75;
                    const top = Math.max(0, (startHour - HOUR_START) * HOUR_HEIGHT);
                    const height = Math.max(28, (endHour - startHour) * HOUR_HEIGHT);
                    const style = getCategoryStyle(ev.category, colorVariants.get(ev.id) ?? 0);
                    return (
                      <button
                        key={ev.id}
                        className={`week-event${selectedId === ev.id ? ' selected' : ''}`}
                        style={{ top, height, background: style.bg, borderLeftColor: style.rail, color: style.text }}
                        onClick={() => onSelect(ev.id)}
                      >
                        <div className="week-event-title">{ev.title}</div>
                        {ev.time && <div className="week-event-time">{ev.time}</div>}
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
