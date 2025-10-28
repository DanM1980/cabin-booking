import { format } from 'date-fns';

/**
 * המרת Date ל-YYYY-MM-DD
 */
export function formatDateForDB(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

/**
 * בדיקה אם תאריך בעבר
 */
export function isDateInPast(date: Date): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);
  return checkDate < today;
}

/**
 * תיאור תאריך בעברית
 */
export function formatDateHebrew(date: Date): string {
  return date.toLocaleDateString('he-IL', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * ולידציה לטלפון ישראלי
 */
export function isValidIsraeliPhone(phone: string): boolean {
  // הסרת רווחים ומקפים
  const cleaned = phone.replace(/[\s-]/g, '');
  // 050-1234567, 05012345678, 972501234567, +972501234567
  return /^(\+?972|0)?5[0-9]{8}$/.test(cleaned);
}

/**
 * ולידציה לאימייל
 */
export function isValidEmail(email: string): boolean {
  if (!email) return true; // אופציונלי
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * פורמט טלפון לתצוגה יפה
 */
export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/[\s-]/g, '');
  if (cleaned.length === 10 && cleaned.startsWith('05')) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
  }
  return phone;
}

