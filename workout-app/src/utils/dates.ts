import {
  startOfWeek, endOfWeek, format, differenceInCalendarDays, addWeeks, isSameDay,
} from 'date-fns';
import type { WeekStart } from '../types';

export function weekStartsOn(weekStart: WeekStart): 0 | 1 {
  return weekStart === 'sunday' ? 0 : 1;
}

export function getWeekStart(date: Date, weekStart: WeekStart): Date {
  return startOfWeek(date, { weekStartsOn: weekStartsOn(weekStart) });
}

export function getWeekEnd(date: Date, weekStart: WeekStart): Date {
  return endOfWeek(date, { weekStartsOn: weekStartsOn(weekStart) });
}

export function formatShort(date: Date): string {
  return format(date, 'MMM d');
}

export function formatFull(date: Date): string {
  return format(date, 'MMM d, yyyy');
}

export function daysUntil(date: Date): number {
  return differenceInCalendarDays(date, new Date());
}

export function weeksBetween(start: Date, count: number): Date[] {
  return Array.from({ length: count }, (_, i) => addWeeks(start, i));
}

export function sameDay(a: Date, b: Date): boolean {
  return isSameDay(a, b);
}

/** Order days of week for display given the user's week start preference. */
export function orderedDays(weekStart: WeekStart): number[] {
  return weekStart === 'sunday' ? [0, 1, 2, 3, 4, 5, 6] : [1, 2, 3, 4, 5, 6, 0];
}

export const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
