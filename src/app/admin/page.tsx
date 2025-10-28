'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { formatDateForDB } from '@/lib/utils';
import { DayStatus, Booking } from '@/types/database';
import { isAdminAuthenticated, loginAdmin, logoutAdmin } from '@/lib/constants';
import Toast, { ToastType } from '@/components/Toast';
import LoadingSpinner from '@/components/LoadingSpinner';

interface ToastState {
  message: string;
  type: ToastType;
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [daysMap, setDaysMap] = useState<Map<string, DayStatus>>(new Map());
  const [bookingsMap, setBookingsMap] = useState<Map<string, Booking>>(new Map());
  const [selectedDates, setSelectedDates] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState({ open: 0, booked: 0, closed: 0 });
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);

  useEffect(() => {
    setIsAuthenticated(isAdminAuthenticated());
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadMonthData(currentMonth);
      loadStats();
    }
  }, [isAuthenticated, currentMonth]);

  // Real-time subscriptions
  useEffect(() => {
    if (!isAuthenticated) return;

    // מנוי לשינויים בלוח השנה
    const calendarSubscription = supabase
      .channel('admin-calendar-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'calendar',
        },
        () => {
          // כשיש שינוי, טוען מחדש
          loadMonthData(currentMonth);
          loadStats();
        }
      )
      .subscribe();

    // מנוי לשינויים בהזמנות
    const bookingsSubscription = supabase
      .channel('admin-bookings-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings',
        },
        () => {
          loadMonthData(currentMonth);
          loadStats();
        }
      )
      .subscribe();

    // ניקוי subscriptions
    return () => {
      calendarSubscription.unsubscribe();
      bookingsSubscription.unsubscribe();
    };
  }, [isAuthenticated, currentMonth]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginAdmin(password)) {
      setIsAuthenticated(true);
      setPassword('');
      setPasswordError('');
    } else {
      setPasswordError('סיסמה שגויה');
    }
  };

  const handleLogout = () => {
    logoutAdmin();
    setIsAuthenticated(false);
    setDaysMap(new Map());
    setSelectedDates(new Set());
  };

  const loadMonthData = async (month: Date) => {
    try {
      setIsLoading(true);

      const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
      const lastDay = new Date(month.getFullYear(), month.getMonth() + 1, 0);

      // טעינת ימים
      const { data, error } = await supabase
        .from('calendar')
        .select('date, status')
        .gte('date', formatDateForDB(firstDay))
        .lte('date', formatDateForDB(lastDay));

      if (error) throw error;

      const newMap = new Map<string, DayStatus>();
      (data || []).forEach((day: any) => {
        newMap.set(day.date, day.status as DayStatus);
      });

      setDaysMap(newMap);

      // טעינת הזמנות
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select('*')
        .gte('date', formatDateForDB(firstDay))
        .lte('date', formatDateForDB(lastDay));

      if (bookingsError) throw bookingsError;

      const newBookingsMap = new Map<string, Booking>();
      (bookingsData || []).forEach((booking: any) => {
        newBookingsMap.set(booking.date, booking);
      });

      setBookingsMap(newBookingsMap);
    } catch (error) {
      console.error('שגיאה בטעינת נתונים:', error);
      setToast({
        message: 'שגיאה בטעינת לוח השנה',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const { data, error } = await supabase.from('calendar').select('status');

      if (error) throw error;

      const stats = {
        open: (data || []).filter((d: any) => d.status === 'open').length,
        booked: (data || []).filter((d: any) => d.status === 'booked').length,
        closed: (data || []).filter((d: any) => d.status === 'closed').length,
      };

      setStats(stats);
    } catch (error) {
      console.error('שגיאה בטעינת סטטיסטיקות:', error);
    }
  };

  const handleOpenDays = async () => {
    if (selectedDates.size === 0) {
      setToast({
        message: 'נא לבחור לפחות יום אחד',
        type: 'error',
      });
      return;
    }

    try {
      const updates = Array.from(selectedDates).map((date) => ({
        date,
        status: 'open' as DayStatus,
      }));

      // @ts-ignore
      const { error } = await supabase.from('calendar').upsert(updates);

      if (error) throw error;

      setToast({
        message: `✅ ${selectedDates.size} ימים נפתחו להזמנה`,
        type: 'success',
      });

      setSelectedDates(new Set());
      setSelectAll(false);
      await loadMonthData(currentMonth);
      await loadStats();
    } catch (error) {
      console.error('שגיאה בפתיחת ימים:', error);
      setToast({
        message: 'שגיאה בפתיחת ימים',
        type: 'error',
      });
    }
  };

  const handleCloseDays = async () => {
    if (selectedDates.size === 0) {
      setToast({
        message: 'נא לבחור לפחות יום אחד',
        type: 'error',
      });
      return;
    }

    // סינון רק ימים שלא מוזמנים
    const datesToClose = Array.from(selectedDates).filter((date) => {
      const status = daysMap.get(date);
      return status !== 'booked';
    });

    if (datesToClose.length === 0) {
      setToast({
        message: 'לא ניתן לסגור ימים מוזמנים ❌',
        type: 'error',
      });
      return;
    }

    try {
      const updates = datesToClose.map((date) => ({
        date,
        status: 'closed' as DayStatus,
      }));

      // @ts-ignore
      const { error } = await supabase.from('calendar').upsert(updates);

      if (error) throw error;

      const skipped = selectedDates.size - datesToClose.length;
      let message = `✅ ${datesToClose.length} ימים נסגרו`;
      if (skipped > 0) {
        message += ` (${skipped} ימים מוזמנים דולגו)`;
      }

      setToast({
        message,
        type: 'success',
      });

      setSelectedDates(new Set());
      setSelectAll(false);
      await loadMonthData(currentMonth);
      await loadStats();
    } catch (error) {
      console.error('שגיאה בסגירת ימים:', error);
      setToast({
        message: 'שגיאה בסגירת ימים',
        type: 'error',
      });
    }
  };

  const toggleDateSelection = (dateStr: string) => {
    const newSelected = new Set(selectedDates);
    if (newSelected.has(dateStr)) {
      newSelected.delete(dateStr);
    } else {
      newSelected.add(dateStr);
    }
    setSelectedDates(newSelected);
    setSelectAll(false);
  };

  const handleSelectAllMonth = () => {
    if (selectAll) {
      // בטל בחירה
      setSelectedDates(new Set());
      setSelectAll(false);
    } else {
      // בחר את כל הימים בחודש
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();

      const allDates = new Set<string>();
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const dateStr = formatDateForDB(date);
        allDates.add(dateStr);
      }

      setSelectedDates(allDates);
      setSelectAll(true);
    }
  };

  const renderCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const weeks: (Date | null)[][] = [];
    let currentWeek: (Date | null)[] = [];

    for (let i = 0; i < startingDayOfWeek; i++) {
      currentWeek.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      currentWeek.push(date);

      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }

    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push(null);
      }
      weeks.push(currentWeek);
    }

    const dayNames = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'];

    return (
      <div className="card">
        {/* ניווט חודש */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setCurrentMonth(new Date(year, month - 1, 1))}
            className="btn btn-secondary text-xl px-6"
            title="חודש קודם"
          >
            →
          </button>
          <h2 className="text-2xl font-bold text-gray-800">
            {currentMonth.toLocaleDateString('he-IL', {
              year: 'numeric',
              month: 'long',
            })}
          </h2>
          <button
            onClick={() => setCurrentMonth(new Date(year, month + 1, 1))}
            className="btn btn-secondary text-xl px-6"
            title="חודש הבא"
          >
            ←
          </button>
        </div>

        {/* גריד לוח שנה */}
        <div className="grid grid-cols-7 gap-2">
          {dayNames.map((name) => (
            <div key={name} className="text-center font-bold text-gray-700 py-2">
              {name}
            </div>
          ))}

          {weeks.map((week, weekIdx) =>
            week.map((date, dayIdx) => {
              if (!date) {
                return <div key={`empty-${weekIdx}-${dayIdx}`} />;
              }

              const dateStr = formatDateForDB(date);
              const status = daysMap.get(dateStr) || 'closed';
              const isSelected = selectedDates.has(dateStr);
              const booking = bookingsMap.get(dateStr);
              const isHovered = hoveredDate === dateStr;

              let bgColor = 'bg-gray-100';
              let textColor = 'text-gray-500';

              if (status === 'open') {
                bgColor = 'bg-green-100';
                textColor = 'text-green-800';
              } else if (status === 'booked') {
                bgColor = 'bg-red-100';
                textColor = 'text-red-800';
              }

              return (
                <div key={dateStr} className="relative">
                  <button
                    onClick={() => toggleDateSelection(dateStr)}
                    onMouseEnter={() => status === 'booked' && setHoveredDate(dateStr)}
                    onMouseLeave={() => setHoveredDate(null)}
                    className={`
                      ${bgColor} ${textColor}
                      h-14 w-full rounded-lg font-semibold text-lg
                      transition-all duration-200
                      hover:scale-105 hover:shadow-md
                      ${isSelected ? 'ring-4 ring-blue-500' : 'border-2 border-gray-300'}
                    `}
                  >
                    {date.getDate()}
                  </button>

                  {/* Tooltip עבור ימים מוזמנים */}
                  {status === 'booked' && booking && isHovered && (
                    <div className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 bg-gray-900 text-white text-sm rounded-lg p-3 shadow-xl pointer-events-none">
                      <div className="text-center font-bold mb-2 border-b border-gray-700 pb-2">
                        📅 פרטי הזמנה
                      </div>
                      <div className="space-y-1 text-right">
                        <div><strong>שם:</strong> {booking.guest_name}</div>
                        <div><strong>טלפון:</strong> {booking.guest_phone}</div>
                        {booking.guest_email && (
                          <div><strong>אימייל:</strong> {booking.guest_email}</div>
                        )}
                      </div>
                      {/* חץ */}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-gray-900"></div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* אגדה */}
        <div className="mt-6 flex flex-wrap gap-4 justify-center text-sm font-medium">
          <div className="legend-item">
            <div className="legend-box bg-green-100 border-green-300"></div>
            <span>פתוח</span>
          </div>
          <div className="legend-item">
            <div className="legend-box bg-red-100 border-red-300"></div>
            <span>מוזמן</span>
          </div>
          <div className="legend-item">
            <div className="legend-box bg-gray-100 border-gray-300"></div>
            <span>סגור</span>
          </div>
        </div>
      </div>
    );
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="card max-w-md w-full">
          <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
            🔒 כניסת מנהל
          </h1>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1 text-gray-700">
                סיסמה
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setPasswordError('');
                }}
                className={`input ${passwordError ? 'border-red-500 ring-2 ring-red-500' : ''}`}
                placeholder="הזן סיסמה"
                autoFocus
              />
              {passwordError && <p className="text-red-500 text-sm mt-1">{passwordError}</p>}
            </div>

            <button type="submit" className="btn btn-primary w-full">
              התחבר
            </button>
          </form>
        </div>

        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* הדר */}
      <header className="header">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">🛠️ ניהול צימר</h1>
              <p className="text-sm text-gray-600">מנהל מחובר</p>
            </div>
            <button onClick={handleLogout} className="btn btn-secondary">
              התנתק
            </button>
          </div>
        </div>
      </header>

      {/* תוכן ראשי */}
      <main className="container mx-auto px-4 py-8">
        {/* סטטיסטיקות - תצוגה מותאמת למובייל */}
        <div className="card mb-8">
          <div className="grid grid-cols-3 gap-3 md:gap-6">
            <div className="text-center">
              <p className="text-sm md:text-lg font-semibold text-green-800">ימים פתוחים</p>
              <p className="text-3xl md:text-4xl font-bold mt-2 text-green-600">{stats.open}</p>
            </div>
            <div className="text-center border-x-2 border-gray-200">
              <p className="text-sm md:text-lg font-semibold text-red-800">ימים מוזמנים</p>
              <p className="text-3xl md:text-4xl font-bold mt-2 text-red-600">{stats.booked}</p>
            </div>
            <div className="text-center">
              <p className="text-sm md:text-lg font-semibold text-gray-800">ימים סגורים</p>
              <p className="text-3xl md:text-4xl font-bold mt-2 text-gray-600">{stats.closed}</p>
            </div>
          </div>
        </div>

        {/* פעולות */}
        <div className="card mb-8">
          <h2 className="text-xl font-bold mb-4 text-gray-800">פעולות</h2>

          {/* כפתורי פעולות עם צ'קבוקס */}
          <div className="flex flex-wrap gap-4 items-center">
            <button
              onClick={handleOpenDays}
              disabled={selectedDates.size === 0}
              className="btn btn-primary"
            >
              🟢 פתח ימים ({selectedDates.size})
            </button>
            <button
              onClick={handleCloseDays}
              disabled={selectedDates.size === 0}
              className="btn btn-danger"
            >
              🔴 סגור ימים ({selectedDates.size})
            </button>

            {/* צ'קבוקס בחר הכל */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectAll}
                onChange={handleSelectAllMonth}
                className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
              />
              <span className="text-base font-semibold text-gray-800">
                בחר את כל החודש
              </span>
            </label>

            <button
              onClick={() => {
                setSelectedDates(new Set());
                setSelectAll(false);
              }}
              disabled={selectedDates.size === 0}
              className="btn btn-secondary"
            >
              נקה בחירה
            </button>
          </div>
        </div>

        {/* לוח שנה */}
        <div className="relative min-h-[400px]">
          {/* Loader overlay */}
          {isLoading && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-2xl flex items-center justify-center z-10">
              <LoadingSpinner />
            </div>
          )}

          {/* לוח שנה - תמיד מוצג */}
          {renderCalendar()}
        </div>
      </main>

      {/* טוסט */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

