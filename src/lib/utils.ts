import { format } from 'date-fns';
import { supabase } from './supabase';

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

/**
 * בדיקה אם משתמש הוא מנהל
 */
export async function isAdmin(phone: string | null): Promise<boolean> {
  if (!phone) return false;
  
  try {
    // ננסה עם הטלפון כמו שהוא
    let { data, error } = await supabase
      .from('admins')
      .select('id')
      .eq('phone', phone)
      .maybeSingle();
    
    // אם לא מצאנו, ננסה עם הטלפון בפורמט נקי (ללא מקפים)
    if (!data && !error) {
      const cleanPhone = phone.replace(/[\s-]/g, '');
      const result = await supabase
        .from('admins')
        .select('id')
        .eq('phone', cleanPhone)
        .maybeSingle();
      data = result.data;
      error = result.error;
    }
    
    // אם לא מצאנו, ננסה עם הטלפון עם מקפים בפורמט 050-1234567
    if (!data && !error && phone.length >= 10) {
      const cleanPhone = phone.replace(/[\s-]/g, '');
      if (cleanPhone.length === 10) {
        const formattedPhone = `${cleanPhone.slice(0, 3)}-${cleanPhone.slice(3)}`;
        const result = await supabase
          .from('admins')
          .select('id')
          .eq('phone', formattedPhone)
          .maybeSingle();
        data = result.data;
        error = result.error;
      }
    }
    
    return !!data && !error;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

/**
 * טיפוס נתוני משתמש
 */
export interface UserData {
  name: string;
  phone: string;
  email?: string;
}

/**
 * שמירת נתוני משתמש מלאים
 */
export function setUserData(userData: UserData): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('userData', JSON.stringify(userData));
    // שמירה גם בפורמט הישן לתאימות לאחור
    localStorage.setItem('userPhone', userData.phone);
  }
}

/**
 * קבלת נתוני משתמש מלאים
 */
export function getUserData(): UserData | null {
  if (typeof window !== 'undefined') {
    const data = localStorage.getItem('userData');
    if (data) {
      try {
        return JSON.parse(data);
      } catch {
        return null;
      }
    }
  }
  return null;
}

/**
 * עדכון נתוני משתמש (חלקי)
 */
export function updateUserData(partial: Partial<UserData>): void {
  const current = getUserData();
  if (current) {
    setUserData({ ...current, ...partial });
  }
}

/**
 * מחיקת נתוני משתמש (התנתקות)
 */
export function clearUserData(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('userData');
    localStorage.removeItem('userPhone'); // מחיקה גם מהפורמט הישן
  }
}

/**
 * @deprecated - השתמש ב-getUserData() במקום
 * שמירת טלפון משתמש
 */
export function setUserPhone(phone: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('userPhone', phone);
  }
}

/**
 * @deprecated - השתמש ב-getUserData() במקום
 * קבלת טלפון משתמש
 */
export function getUserPhone(): string | null {
  if (typeof window !== 'undefined') {
    // ננסה קודם userData החדש
    const userData = getUserData();
    if (userData) return userData.phone;
    // נפילה לפורמט הישן
    return localStorage.getItem('userPhone');
  }
  return null;
}

/**
 * @deprecated - השתמש ב-clearUserData() במקום
 * מחיקת טלפון משתמש (התנתקות)
 */
export function clearUserPhone(): void {
  clearUserData();
}

