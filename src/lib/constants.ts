// סיסמת מנהל
export const ADMIN_PASSWORD = 'fatlady';

// מפתח sessionStorage
export const ADMIN_SESSION_KEY = 'cabin_admin_authenticated';

// בדיקה אם מנהל מחובר
export function isAdminAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  return sessionStorage.getItem(ADMIN_SESSION_KEY) === 'true';
}

// התחברות מנהל
export function loginAdmin(password: string): boolean {
  if (password === ADMIN_PASSWORD) {
    sessionStorage.setItem(ADMIN_SESSION_KEY, 'true');
    return true;
  }
  return false;
}

// התנתקות מנהל
export function logoutAdmin(): void {
  sessionStorage.removeItem(ADMIN_SESSION_KEY);
}

