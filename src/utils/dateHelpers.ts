import {
  addDays,
  differenceInDays,
  format,
  parseISO,
  startOfWeek,
} from "date-fns";
import { ru } from "date-fns/locale";

export const formatDate = (
  date: Date | string,
  formatStr: string = "dd.MM.yyyy"
): string => {
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  return format(dateObj, formatStr, { locale: ru });
};

export const formatDateShort = (date: Date | string): string => {
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  return format(dateObj, "d MMM", { locale: ru });
};

// Формат для календаря: "23 ноября"
export const formatCalendarDay = (date: Date | string): string => {
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  return format(dateObj, "d MMMM", { locale: ru });
};

// Формат диапазона для календаря:
// - если год один и тот же: "23 ноября - 26 ноября"
// - если годы разные: "30 декабря 2025 - 5 января 2026"
export const formatCalendarRange = (
  start: Date | string,
  end: Date | string
): string => {
  const startDate = typeof start === "string" ? parseISO(start) : start;
  const endDate = typeof end === "string" ? parseISO(end) : end;

  const startYear = startDate.getFullYear();
  const endYear = endDate.getFullYear();

  if (startYear === endYear) {
    const startStr = format(startDate, "d MMMM", { locale: ru });
    const endStr = format(endDate, "d MMMM", { locale: ru });
    return `${startStr} - ${endStr}`;
  }

  const startStr = format(startDate, "d MMMM yyyy", { locale: ru });
  const endStr = format(endDate, "d MMMM yyyy", { locale: ru });
  return `${startStr} - ${endStr}`;
};

export const getWeekDays = (startDate: Date = new Date()): Date[] => {
  const start = startOfWeek(startDate, { weekStartsOn: 1 });
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
};

export const getDaysBetween = (
  start: Date | string,
  end: Date | string
): number => {
  const startDate = typeof start === "string" ? parseISO(start) : start;
  const endDate = typeof end === "string" ? parseISO(end) : end;
  return differenceInDays(endDate, startDate);
};

export const toISODate = (date: Date): string => {
  return format(date, "yyyy-MM-dd");
};
