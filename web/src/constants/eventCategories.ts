// Ported directly from ../../../src/constants/eventCategories.ts (mobile) — same real
// 5-category palette, same 3-shade-per-category variant system for overlap-differentiation.
import { EventCategory } from '../types';

export interface EventCategoryStyle {
  labelKey: string;
  bg: string;
  rail: string;
  railContinuation: string;
  text: string;
}

export const CATEGORY_VARIANT_COUNT = 3;

export const EVENT_CATEGORY_VARIANTS: Record<EventCategory, EventCategoryStyle[]> = {
  travel: [
    { labelKey: 'calendar.categoryTravel', bg: '#BEECC6', rail: '#348F4F', railContinuation: '#348F4F99', text: '#05441D' },
    { labelKey: 'calendar.categoryTravel', bg: '#CCF0D2', rail: '#63AB74', railContinuation: '#63AB7499', text: '#003F17' },
    { labelKey: 'calendar.categoryTravel', bg: '#B2E3BB', rail: '#006D26', railContinuation: '#006D2699', text: '#003B0E' },
  ],
  training: [
    { labelKey: 'calendar.categoryTraining', bg: '#FFE4B3', rail: '#D49838', railContinuation: '#D4983899', text: '#603800' },
    { labelKey: 'calendar.categoryTraining', bg: '#FFE8C2', rail: '#E4B572', railContinuation: '#E4B57299', text: '#5A3200' },
    { labelKey: 'calendar.categoryTraining', bg: '#FAD9A2', rail: '#B37000', railContinuation: '#B3700099', text: '#572B00' },
  ],
  meeting: [
    { labelKey: 'calendar.categoryMeeting', bg: '#C7E9FF', rail: '#467CC0', railContinuation: '#467CC099', text: '#113D70' },
    { labelKey: 'calendar.categoryMeeting', bg: '#D5EEFF', rail: '#6D9BD5', railContinuation: '#6D9BD599', text: '#0B376A' },
    { labelKey: 'calendar.categoryMeeting', bg: '#B8DFFF', rail: '#1B589E', railContinuation: '#1B589E99', text: '#003169' },
  ],
  vacation: [
    { labelKey: 'calendar.categoryVacation', bg: '#E9DEFF', rail: '#8668B6', railContinuation: '#8668B699', text: '#4B346F' },
    { labelKey: 'calendar.categoryVacation', bg: '#EFE6FF', rail: '#A18BCA', railContinuation: '#A18BCA99', text: '#462E69' },
    { labelKey: 'calendar.categoryVacation', bg: '#E0D2FD', rail: '#644395', railContinuation: '#64439599', text: '#422667' },
  ],
  internal: [
    { labelKey: 'calendar.categoryInternal', bg: '#E8E8E6', rail: '#1C1C1E', railContinuation: '#1C1C1E99', text: '#2E2E2E' },
    { labelKey: 'calendar.categoryInternal', bg: '#EEEEEE', rail: '#3A3A3C', railContinuation: '#3A3A3C99', text: '#383838' },
    { labelKey: 'calendar.categoryInternal', bg: '#D9D7D3', rail: '#000000', railContinuation: '#00000099', text: '#242424' },
  ],
};

export const DEFAULT_EVENT_CATEGORY: EventCategory = 'internal';

export function getCategoryStyle(category: EventCategory | undefined, variantIndex = 0): EventCategoryStyle {
  const variants = EVENT_CATEGORY_VARIANTS[category ?? DEFAULT_EVENT_CATEGORY];
  const idx = ((variantIndex % variants.length) + variants.length) % variants.length;
  return variants[idx];
}
