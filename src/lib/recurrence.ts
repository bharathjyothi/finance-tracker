import { addDays, addMonths, addQuarters, addWeeks, addYears, formatISO, parseISO } from "date-fns";
import type { Recurrence } from "../db/types";

export function nextDueDate(dueDate: string, recurrence: Recurrence): string | null {
  const date = parseISO(dueDate);
  switch (recurrence) {
    case "once":
      return null;
    case "weekly":
      return formatISO(addWeeks(date, 1), { representation: "date" });
    case "biweekly":
      return formatISO(addWeeks(date, 2), { representation: "date" });
    case "monthly":
      return formatISO(addMonths(date, 1), { representation: "date" });
    case "quarterly":
      return formatISO(addQuarters(date, 1), { representation: "date" });
    case "yearly":
      return formatISO(addYears(date, 1), { representation: "date" });
  }
}

/** Upcoming occurrence dates for a bill within [from, to], for calendar/preview display. */
export function upcomingOccurrences(dueDate: string, recurrence: Recurrence, to: Date): string[] {
  const occurrences: string[] = [];
  let current: string | null = dueDate;
  let guard = 0;
  while (current && parseISO(current) <= to && guard < 60) {
    occurrences.push(current);
    if (recurrence === "once") break;
    current = nextDueDate(current, recurrence);
    guard += 1;
  }
  return occurrences;
}

export function daysUntil(dueDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = parseISO(dueDate);
  due.setHours(0, 0, 0, 0);
  return Math.round((due.getTime() - today.getTime()) / 86_400_000);
}

export function isPastDue(dueDate: string): boolean {
  return daysUntil(dueDate) < 0;
}

export const addDaysIso = (dueDate: string, days: number) =>
  formatISO(addDays(parseISO(dueDate), days), { representation: "date" });
