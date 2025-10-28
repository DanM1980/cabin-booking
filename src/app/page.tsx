'use client';

import { useState, useEffect } from 'react';
import { DayPicker } from 'react-day-picker';
import { supabase } from '@/lib/supabase';
import { formatDateForDB, isDateInPast, formatDateHebrew, getUserData, setUserData, clearUserData, isAdmin, UserData } from '@/lib/utils';
import { DayStatus, Booking, GuestbookEntry as GuestbookEntryType } from '@/types/database';
import Modal from '@/components/Modal';
import BookingForm from '@/components/BookingForm';
import EditBookingForm from '@/components/EditBookingForm';
import GuestbookForm from '@/components/GuestbookForm';
import GuestbookEntry from '@/components/GuestbookEntry';
import LoginModal from '@/components/LoginModal';
import Toast, { ToastType } from '@/components/Toast';
import LoadingSpinner from '@/components/LoadingSpinner';
import { he } from 'date-fns/locale';
import 'react-day-picker/dist/style.css';

interface ToastState {
  message: string;
  type: ToastType;
}

interface DayInfo {
  status: DayStatus;
  booking?: Booking;
}

export default function HomePage() {
  const [daysMap, setDaysMap] = useState<Map<string, DayInfo>>(new Map());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedDateInfo, setSelectedDateInfo] = useState<DayInfo | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  // ספר אורחים
  const [guestbookEntries, setGuestbookEntries] = useState<GuestbookEntryType[]>([]);
  const [isGuestbookFormOpen, setIsGuestbookFormOpen] = useState(false);
  const [isGuestbookLoading, setIsGuestbookLoading] = useState(false);

  // מעקב אחרי מצב פופאפים לטיפול בכפתור חזור
  const [hasModalHistoryEntry, setHasModalHistoryEntry] = useState(false);

  // משתמש ומנהל
  const [userData, setUserDataState] = useState<UserData | null>(null);
  const [isUserAdmin, setIsUserAdmin] = useState(false);

  // Login Modal
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<'book' | 'guestbook' | null>(null);

  // טעינת נתונים לחודש
  const loadMonthData = async (month: Date) => {
    try {
      setIsLoading(true);

      const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
      const lastDay = new Date(month.getFullYear(), month.getMonth() + 1, 0);

      // טעינת ימים
      const { data: calendarData, error: calError } = await supabase
        .from('calendar')
        .select('date, status')
        .gte('date', formatDateForDB(firstDay))
        .lte('date', formatDateForDB(lastDay));

      if (calError) throw calError;

      // טעינת הזמנות
      const { data: bookingsData, error: bookError } = await supabase
        .from('bookings')
        .select('*')
        .gte('date', formatDateForDB(firstDay))
        .lte('date', formatDateForDB(lastDay));

      if (bookError) throw bookError;

      // בניית Map
      const newMap = new Map<string, DayInfo>();

      (calendarData || []).forEach((day: any) => {
        const booking = (bookingsData || []).find((b: any) => b.date === day.date);
        newMap.set(day.date, {
          status: day.status as DayStatus,
          booking: booking || undefined,
        });
      });

      setDaysMap(newMap);
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

  // טעינת ספר אורחים
  const loadGuestbook = async () => {
    try {
      setIsGuestbookLoading(true);
      const { data, error } = await supabase
        .from('guestbook')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      setGuestbookEntries(data || []);
    } catch (error) {
      console.error('שגיאה בטעינת ספר אורחים:', error);
      setToast({
        message: 'שגיאה בטעינת ספר האורחים',
        type: 'error',
      });
    } finally {
      setIsGuestbookLoading(false);
    }
  };

  // זיהוי משתמש אוטומטי בטעינת הדף
  useEffect(() => {
    const data = getUserData();
    if (data) {
      setUserDataState(data);
      // בדיקה אם מנהל
      isAdmin(data.phone).then(setIsUserAdmin);
    }
  }, []);

  useEffect(() => {
    loadMonthData(currentMonth);
    loadGuestbook();
  }, [currentMonth]);

  // Real-time subscriptions
  useEffect(() => {
    // מנוי לשינויים בלוח השנה
    const calendarSubscription = supabase
      .channel('calendar-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'calendar',
        },
        () => {
          // כשיש שינוי, טוען מחדש את נתוני החודש
          loadMonthData(currentMonth);
        }
      )
      .subscribe();

    // מנוי לשינויים בהזמנות
    const bookingsSubscription = supabase
      .channel('bookings-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings',
        },
        () => {
          loadMonthData(currentMonth);
        }
      )
      .subscribe();

    // מנוי לשינויים בספר אורחים
    const guestbookSubscription = supabase
      .channel('guestbook-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'guestbook',
        },
        () => {
          loadGuestbook();
        }
      )
      .subscribe();

    // ניקוי subscriptions כשהקומפוננטה נסגרת
    return () => {
      calendarSubscription.unsubscribe();
      bookingsSubscription.unsubscribe();
      guestbookSubscription.unsubscribe();
    };
  }, [currentMonth]); // תלוי ב-currentMonth כדי לעדכן את המנוי כשמשנים חודש

  // טיפול בכפתור חזור - סגירת פופאפים
  useEffect(() => {
    const isAnyModalOpen = isModalOpen || isGuestbookFormOpen;

    // כשנפתח מודאל - נוסיף entry להיסטוריה
    if (isAnyModalOpen && !hasModalHistoryEntry) {
      window.history.pushState({ modal: true }, '');
      setHasModalHistoryEntry(true);
    }

    // כשנסגר מודאל ידנית - רק נעדכן את ה-flag
    if (!isAnyModalOpen && hasModalHistoryEntry) {
      setHasModalHistoryEntry(false);
    }
  }, [isModalOpen, isGuestbookFormOpen, hasModalHistoryEntry]);

  // האזנה לכפתור חזור
  useEffect(() => {
    const handlePopState = () => {
      const isAnyModalOpen = isModalOpen || isGuestbookFormOpen;

      if (isAnyModalOpen) {
        // אם יש מודאל פתוח - נסגור אותו
        if (isModalOpen) {
          setIsModalOpen(false);
          setSelectedDate(undefined);
          setSelectedDateInfo(null);
        }
        if (isGuestbookFormOpen) {
          setIsGuestbookFormOpen(false);
        }
        setHasModalHistoryEntry(false);
      }
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isModalOpen, isGuestbookFormOpen]);

  const handleMonthChange = (month: Date) => {
    // מונע דפדוף לחודשים בעבר
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonthNum = today.getMonth();

    const selectedYear = month.getFullYear();
    const selectedMonth = month.getMonth();

    // אם החודש המבוקש הוא בעבר, לא מאפשרים
    if (selectedYear < currentYear || (selectedYear === currentYear && selectedMonth < currentMonthNum)) {
      return;
    }

    setCurrentMonth(month);
  };

  const handleDayClick = (date: Date) => {
    const dateStr = formatDateForDB(date);
    const dayInfo = daysMap.get(dateStr);

    // אם היום לא קיים או סגור - לא עושים כלום
    if (!dayInfo || dayInfo.status === 'closed') {
      return;
    }

    // אם התאריך בעבר
    if (isDateInPast(date)) {
      setToast({
        message: 'לא ניתן להזמין תאריכים שעברו',
        type: 'error',
      });
      return;
    }

    // בדיקת הרשאות אם היום מוזמן
    if (dayInfo.status === 'booked' && dayInfo.booking) {
      // בדיקה אם המשתמש יכול לערוך (בעל ההזמנה או מנהל)
      const canEdit = isUserAdmin || dayInfo.booking.guest_phone === userData?.phone;

      if (!canEdit) {
        setToast({
          message: 'היום מוזמן על ידי משתמש אחר',
          type: 'error',
        });
        return;
      }
    }

    // Lazy Auth - יום פנוי ומשתמש לא מחובר
    if (dayInfo.status === 'open' && !userData) {
      setSelectedDate(date);
      setSelectedDateInfo(dayInfo);
      setPendingAction('book');
      setIsLoginModalOpen(true);
      return;
    }

    // משתמש מחובר או יום מוזמן - פתיחת המודאל
    setSelectedDate(date);
    setSelectedDateInfo(dayInfo);
    setIsModalOpen(true);
  };

  const handleNewBooking = async (bookingData: {
    name: string;
    phone: string;
    email?: string;
  }) => {
    if (!selectedDate) return;

    try {
      const dateStr = formatDateForDB(selectedDate);

      // עדכון userData אם השתנה משהו
      if (userData) {
        const hasChanged =
          userData.name !== bookingData.name ||
          userData.phone !== bookingData.phone ||
          userData.email !== bookingData.email;

        if (hasChanged) {
          const newUserData: UserData = {
            name: bookingData.name,
            phone: bookingData.phone,
            email: bookingData.email,
          };
          setUserData(newUserData);
          setUserDataState(newUserData);
          // בדיקה מחדש אם מנהל
          const adminStatus = await isAdmin(bookingData.phone);
          setIsUserAdmin(adminStatus);
        }
      }

      // יצירת הזמנה
      // @ts-ignore
      const { error: bookError } = await supabase.from('bookings').insert({
        date: dateStr,
        guest_name: bookingData.name,
        guest_phone: bookingData.phone,
        guest_email: bookingData.email || null,
      });

      if (bookError) throw bookError;

      // עדכון סטטוס ליום
      const { error: calError } = await supabase
        .from('calendar')
        // @ts-ignore
        .update({ status: 'booked' })
        .eq('date', dateStr);

      if (calError) throw calError;

      setToast({
        message: 'הזמנה נרשמה בהצלחה ✅',
        type: 'success',
      });

      setIsModalOpen(false);
      setSelectedDate(undefined);
      setSelectedDateInfo(null);
      await loadMonthData(currentMonth);
    } catch (error: any) {
      console.error('שגיאה בהזמנה:', error);
      if (error.code === '23505') {
        // unique constraint
        setToast({
          message: 'היום כבר מוזמן ❌',
          type: 'error',
        });
      } else {
        setToast({
          message: 'אירעה שגיאה בביצוע ההזמנה',
          type: 'error',
        });
      }
    }
  };

  const handleUpdateBooking = async (updateData: {
    name: string;
    phone: string;
    email?: string;
  }) => {
    if (!selectedDate || !selectedDateInfo?.booking) return;

    try {
      const { error } = await supabase
        .from('bookings')
        // @ts-ignore
        .update({
          guest_name: updateData.name,
          guest_phone: updateData.phone,
          guest_email: updateData.email || null,
        })
        .eq('id', selectedDateInfo.booking.id);

      if (error) throw error;

      setToast({
        message: 'ההזמנה עודכנה בהצלחה ✅',
        type: 'success',
      });

      setIsModalOpen(false);
      setSelectedDate(undefined);
      setSelectedDateInfo(null);
      await loadMonthData(currentMonth);
    } catch (error) {
      console.error('שגיאה בעדכון:', error);
      setToast({
        message: 'אירעה שגיאה בעדכון ההזמנה',
        type: 'error',
      });
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!selectedDate) return;

    try {
      const dateStr = formatDateForDB(selectedDate);

      // מחיקת ההזמנה
      const { error: delError } = await supabase
        .from('bookings')
        .delete()
        .eq('id', bookingId);

      if (delError) throw delError;

      // החזרת היום למצב פנוי
      const { error: calError } = await supabase
        .from('calendar')
        // @ts-ignore
        .update({ status: 'open' })
        .eq('date', dateStr);

      if (calError) throw calError;

      setToast({
        message: 'ההזמנה בוטלה בהצלחה ✅',
        type: 'success',
      });

      setIsModalOpen(false);
      setSelectedDate(undefined);
      setSelectedDateInfo(null);
      await loadMonthData(currentMonth);
    } catch (error) {
      console.error('שגיאה בביטול:', error);
      setToast({
        message: 'אירעה שגיאה בביטול ההזמנה',
        type: 'error',
      });
    }
  };

  const handleAddGuestbookEntry = async (data: { name: string; phone: string; message: string }) => {
    try {
      // עדכון userData אם השתנה משהו
      if (userData) {
        const hasChanged =
          userData.name !== data.name ||
          userData.phone !== data.phone;

        if (hasChanged) {
          const newUserData: UserData = {
            name: data.name,
            phone: data.phone,
            email: userData.email,
          };
          setUserData(newUserData);
          setUserDataState(newUserData);
        }
      }

      // @ts-ignore
      const { error } = await supabase.from('guestbook').insert({
        guest_name: data.name,
        guest_phone: data.phone,
        message: data.message,
      });

      if (error) throw error;

      setToast({
        message: 'ההודעה נוספה בהצלחה ✅',
        type: 'success',
      });

      setIsGuestbookFormOpen(false);
      await loadGuestbook();
    } catch (error) {
      console.error('שגיאה בהוספת הודעה:', error);
      setToast({
        message: 'אירעה שגיאה בהוספת ההודעה',
        type: 'error',
      });
    }
  };

  const handleDeleteGuestbookEntry = async (id: string, entryPhone: string) => {
    try {
      // בדיקת הרשאות
      const canDelete = isUserAdmin || entryPhone === userData?.phone;

      if (!canDelete) {
        setToast({
          message: 'אין לך הרשאה למחוק הודעה זו',
          type: 'error',
        });
        return;
      }

      const { error } = await supabase
        .from('guestbook')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setToast({
        message: 'ההודעה נמחקה בהצלחה ✅',
        type: 'success',
      });

      await loadGuestbook();
    } catch (error) {
      console.error('שגיאה במחיקת הודעה:', error);
      setToast({
        message: 'אירעה שגיאה במחיקת ההודעה',
        type: 'error',
      });
    }
  };

  // Login Modal Handlers
  const handleLoginSubmit = async (newUserData: UserData) => {
    setUserData(newUserData);
    setUserDataState(newUserData);

    // בדיקה אם מנהל
    const adminStatus = await isAdmin(newUserData.phone);
    setIsUserAdmin(adminStatus);

    setIsLoginModalOpen(false);

    // המשך לפעולה שהייתה ממתינה
    if (pendingAction === 'book' && selectedDate) {
      setIsModalOpen(true);
    } else if (pendingAction === 'guestbook') {
      setIsGuestbookFormOpen(true);
    }

    setPendingAction(null);
  };

  const handleLoginCancel = () => {
    setIsLoginModalOpen(false);
    setPendingAction(null);
    setSelectedDate(undefined);
    setSelectedDateInfo(null);
  };

  const handleEditUserData = async (newUserData: UserData) => {
    setUserData(newUserData);
    setUserDataState(newUserData);

    // בדיקה מחדש אם מנהל
    const adminStatus = await isAdmin(newUserData.phone);
    setIsUserAdmin(adminStatus);

    setIsEditModalOpen(false);

    setToast({
      message: 'הפרטים עודכנו בהצלחה ✅',
      type: 'success',
    });
  };

  const handleLogout = () => {
    clearUserData();
    setUserDataState(null);
    setIsUserAdmin(false);
    window.location.reload();
  };

  const handleGuestbookClick = () => {
    if (!userData) {
      setPendingAction('guestbook');
      setIsLoginModalOpen(true);
    } else {
      setIsGuestbookFormOpen(true);
    }
  };

  const getDayModifiers = () => {
    const openDays: Date[] = [];
    const bookedDays: Date[] = [];

    daysMap.forEach((info, dateStr) => {
      const [year, month, day] = dateStr.split('-').map(Number);
      const date = new Date(year, month - 1, day);

      if (info.status === 'open') {
        openDays.push(date);
      } else if (info.status === 'booked') {
        bookedDays.push(date);
      }
    });

    return { openDays, bookedDays };
  };

  const { openDays, bookedDays } = getDayModifiers();

  return (
    <div className="min-h-screen flex flex-col">
      {/* הדר עם שקיפות */}
      <header className="header">
        <div className="container mx-auto px-4 py-6">
          <div className="relative mb-2">
            {/* פרטי משתמש - צמוד לשמאל */}
            {userData && (
              <div className="absolute left-0 top-0 flex flex-col gap-1">
                <span className={`text-sm font-semibold whitespace-nowrap ${isUserAdmin ? 'text-amber-600' : 'text-gray-700'}`}>
                  {isUserAdmin && '👑 '}{userData.name}
                </span>
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="text-xs text-gray-500 hover:text-gray-700 underline text-left"
                >
                  ערוך פרטים
                </button>
                <button
                  onClick={handleLogout}
                  className="text-xs text-gray-500 hover:text-gray-700 underline text-left"
                >
                  התנתק
                </button>
              </div>
            )}

            {/* כותרת - במרכז */}
            <h1 className="text-3xl font-bold text-center text-gray-900">
              נופש בארי בגולן
            </h1>
          </div>

          <p className="text-center text-gray-600">
            בחר תאריך להזמנה או לעריכה
          </p>
        </div>
      </header>

      {/* תוכן ראשי */}
      <main className="container mx-auto px-4 py-8 flex-1">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* אגדה */}
          <div className="card">
            <div className="flex items-center gap-6 justify-center flex-wrap text-sm font-medium">
              <div className="legend-item">
                <div className="legend-box bg-green-100 border-green-300"></div>
                <span className="text-gray-700">יום פנוי</span>
              </div>
              <div className="legend-item">
                <div className="legend-box bg-red-100 border-red-300"></div>
                <span className="text-gray-700">יום מוזמן</span>
              </div>
              <div className="legend-item">
                <div className="legend-box bg-gray-100 border-gray-300"></div>
                <span className="text-gray-700">לא זמין</span>
              </div>
            </div>
          </div>

          {/* לוח שנה */}
          <div className="card relative min-h-[400px]">
            {/* Loader overlay */}
            {isLoading && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-2xl flex items-center justify-center z-10">
                <LoadingSpinner />
              </div>
            )}

            {/* לוח שנה - תמיד מוצג */}
            <div className="flex justify-center">
              <DayPicker
                mode="single"
                selected={selectedDate}
                onDayClick={handleDayClick}
                onMonthChange={handleMonthChange}
                month={currentMonth}
                locale={he}
                fromDate={new Date()}
                modifiers={{
                  open: openDays,
                  booked: bookedDays,
                }}
                modifiersStyles={{
                  open: {
                    backgroundColor: '#dcfce7',
                    color: '#166534',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                  },
                  booked: {
                    backgroundColor: '#fee2e2',
                    color: '#991b1b',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                  },
                }}
                disabled={(date) => {
                  const dateStr = formatDateForDB(date);
                  const dayInfo = daysMap.get(dateStr);
                  // השבת תאריכים בעבר, ימים שלא קיימים, או ימים סגורים
                  return isDateInPast(date) || !dayInfo || dayInfo.status === 'closed';
                }}
                className="rtl-calendar"
              />
            </div>
          </div>

          {/* ספר אורחים */}
          <div className="card relative min-h-[200px]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-800">
                📖 ספר אורחים
              </h2>
              <button
                onClick={handleGuestbookClick}
                className="btn btn-primary"
              >
                ✍️ כתוב הודעה
              </button>
            </div>

            {/* Loader overlay */}
            {isGuestbookLoading && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-2xl flex items-center justify-center z-10">
                <LoadingSpinner />
              </div>
            )}

            {/* תוכן - תמיד מוצג */}
            {guestbookEntries.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p className="text-lg mb-2">עדיין אין הודעות בספר האורחים</p>
                <p className="text-sm">היה הראשון לשתף את החוויה שלך!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {guestbookEntries.map((entry) => (
                  <GuestbookEntry
                    key={entry.id}
                    entry={entry}
                    canDelete={isUserAdmin || entry.guest_phone === userData?.phone}
                    onDelete={() => handleDeleteGuestbookEntry(entry.id, entry.guest_phone)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* מודאל הזמנה / עריכה */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        {selectedDate && selectedDateInfo && (
          <>
            {selectedDateInfo.status === 'open' ? (
              <BookingForm
                date={selectedDate}
                onSubmit={handleNewBooking}
                onCancel={() => {
                  setIsModalOpen(false);
                  setSelectedDate(undefined);
                  setSelectedDateInfo(null);
                }}
                initialUserData={userData}
              />
            ) : selectedDateInfo.status === 'booked' && selectedDateInfo.booking ? (
              <EditBookingForm
                date={selectedDate}
                booking={selectedDateInfo.booking}
                onUpdate={handleUpdateBooking}
                onCancel={handleCancelBooking}
                onClose={() => {
                  setIsModalOpen(false);
                  setSelectedDate(undefined);
                  setSelectedDateInfo(null);
                }}
              />
            ) : null}
          </>
        )}
      </Modal>

      {/* מודאל ספר אורחים */}
      <Modal isOpen={isGuestbookFormOpen} onClose={() => setIsGuestbookFormOpen(false)}>
        <GuestbookForm
          onSubmit={handleAddGuestbookEntry}
          onCancel={() => setIsGuestbookFormOpen(false)}
          initialUserData={userData}
        />
      </Modal>

      {/* מודאל התחברות */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={handleLoginCancel}
        onSubmit={handleLoginSubmit}
        mode="login"
      />

      {/* מודאל עריכת פרטים */}
      <LoginModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleEditUserData}
        mode="edit"
        initialData={userData}
      />

      {/* טוסט הודעות */}
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

