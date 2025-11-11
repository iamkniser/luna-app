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
