import { format, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';

export const formatDate = (isoDate: string): string => {
  return format(parseISO(isoDate), 'd MMM yyyy', { locale: vi });
};

export const formatMonthYear = (isoDate: string): string => {
  return format(parseISO(isoDate), 'MMMM yyyy', { locale: vi });
};

export const toISODate = (date: Date = new Date()): string => {
  return format(date, 'yyyy-MM-dd');
};
