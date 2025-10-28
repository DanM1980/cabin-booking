'use client';

import { useState, useEffect } from 'react';
import { DayPicker } from 'react-day-picker';
import { supabase } from '@/lib/supabase';
import { formatDateForDB, isDateInPast, formatDateHebrew } from '@/lib/utils';
import { DayStatus, Booking } from '@/types/database';
import Modal from '@/components/Modal';
import BookingForm from '@/components/BookingForm';
import EditBookingForm from '@/components/EditBookingForm';
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

      (calendarData || []).forEach((day) => {
        const booking = (bookingsData || []).find((b) => b.date === day.date);
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

  useEffect(() => {
    loadMonthData(currentMonth);
  }, [currentMonth]);

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

      // יצירת הזמנה
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
          <h1 className="text-3xl font-bold text-center text-gray-900">
            נופש בארי בגולן
          </h1>
          <p className="text-center text-gray-600 mt-2">
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
          <div className="card">
            {isLoading ? (
              <LoadingSpinner />
            ) : (
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

