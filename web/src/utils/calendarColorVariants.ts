// Ported from ../../../src/utils/calendarRibbons.ts's assignEventColorVariants — computed
// once over the full event list so a multi-day event's color stays stable across every
// week/month it spans, and overlapping same-category events land on different variants.
import { CalendarEvent } from '../types';
import { CATEGORY_VARIANT_COUNT } from '../constants/eventCategories';

function eventRangeOverlaps(a: CalendarEvent, b: CalendarEvent): boolean {
  const aEnd = a.endDate && a.endDate > a.date ? a.endDate : a.date;
  const bEnd = b.endDate && b.endDate > b.date ? b.endDate : b.date;
  return a.date <= bEnd && b.date <= aEnd;
}

export function assignEventColorVariants(events: CalendarEvent[]): Map<string, number> {
  const result = new Map<string, number>();
  const byCategory = new Map<string, CalendarEvent[]>();

  for (const event of events) {
    const cat = event.category ?? '__none__';
    const group = byCategory.get(cat);
    if (group) group.push(event);
    else byCategory.set(cat, [event]);
  }

  for (const group of byCategory.values()) {
    const sorted = [...group].sort((a, b) => {
      const aEnd = a.endDate && a.endDate > a.date ? a.endDate : a.date;
      const bEnd = b.endDate && b.endDate > b.date ? b.endDate : b.date;
      return a.date.localeCompare(b.date) || bEnd.localeCompare(aEnd);
    });

    const assigned: CalendarEvent[] = [];
    for (const event of sorted) {
      const usedByOverlapping = new Set(
        assigned.filter((other) => eventRangeOverlaps(event, other)).map((other) => result.get(other.id))
      );
      let variant = 0;
      while (usedByOverlapping.has(variant) && variant < CATEGORY_VARIANT_COUNT - 1) {
        variant++;
      }
      result.set(event.id, variant);
      assigned.push(event);
    }
  }

  return result;
}
