-- =====================================================
-- מערכת הזמנות צימר - Supabase Schema (גרסה פשוטה)
-- =====================================================

-- טבלת ימים בלוח שנה
CREATE TABLE IF NOT EXISTS calendar (
  date DATE PRIMARY KEY,
  status TEXT NOT NULL CHECK (status IN ('closed', 'open', 'booked')) DEFAULT 'closed',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- אינדקס לביצועים
CREATE INDEX IF NOT EXISTS idx_calendar_status_date ON calendar(status, date);

-- טבלת הזמנות
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE UNIQUE NOT NULL REFERENCES calendar(date) ON DELETE CASCADE,
  guest_name TEXT NOT NULL,
  guest_phone TEXT NOT NULL,
  guest_email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- אינדקס לביצועים
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(date);

-- =====================================================
-- טבלת ספר אורחים
-- =====================================================

CREATE TABLE guestbook (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  guest_name VARCHAR(100) NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- אינדקס לשליפה מהירה לפי תאריך
CREATE INDEX idx_guestbook_created_at ON guestbook(created_at DESC);

-- =====================================================
-- Row Level Security (RLS) - פשוט ופתוח
-- =====================================================

-- אפשר RLS
ALTER TABLE calendar ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE guestbook ENABLE ROW LEVEL SECURITY;

-- מחיקת פוליסיות קיימות
DROP POLICY IF EXISTS "Allow public read calendar" ON calendar;
DROP POLICY IF EXISTS "Allow public write calendar" ON calendar;
DROP POLICY IF EXISTS "Allow public read bookings" ON bookings;
DROP POLICY IF EXISTS "Allow public write bookings" ON bookings;

-- Calendar Policies - גישה מלאה לכולם!
CREATE POLICY "Allow public read calendar" ON calendar
  FOR SELECT
  USING (true);

CREATE POLICY "Allow public write calendar" ON calendar
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Bookings Policies - גישה מלאה לכולם!
CREATE POLICY "Allow public read bookings" ON bookings
  FOR SELECT
  USING (true);

CREATE POLICY "Allow public write bookings" ON bookings
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Guestbook Policies - גישה מלאה לכולם!
CREATE POLICY "Allow public read guestbook" ON guestbook
  FOR SELECT
  USING (true);

CREATE POLICY "Allow public write guestbook" ON guestbook
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public delete guestbook" ON guestbook
  FOR DELETE
  USING (true);

-- =====================================================
-- Functions עזר
-- =====================================================

-- פונקציה לקבלת הזמנה לפי תאריך
CREATE OR REPLACE FUNCTION public.get_booking_by_date(p_date DATE)
RETURNS TABLE (
  id UUID,
  date DATE,
  guest_name TEXT,
  guest_phone TEXT,
  guest_email TEXT,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT b.id, b.date, b.guest_name, b.guest_phone, b.guest_email, b.created_at
  FROM bookings b
  WHERE b.date = p_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- הרשאות
GRANT EXECUTE ON FUNCTION public.get_booking_by_date(DATE) TO anon;
GRANT EXECUTE ON FUNCTION public.get_booking_by_date(DATE) TO authenticated;

-- =====================================================
-- Triggers לעדכון updated_at
-- =====================================================

-- פונקציה לעדכון updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger עבור calendar
DROP TRIGGER IF EXISTS update_calendar_updated_at ON calendar;
CREATE TRIGGER update_calendar_updated_at
    BEFORE UPDATE ON calendar
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger עבור bookings
DROP TRIGGER IF EXISTS update_bookings_updated_at ON bookings;
CREATE TRIGGER update_bookings_updated_at
    BEFORE UPDATE ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- נתוני דוגמה (אופציונלי - להסיר לפרודקשן)
-- =====================================================

-- דוגמאות ימים
-- INSERT INTO calendar (date, status) VALUES
--   ('2025-01-15', 'open'),
--   ('2025-01-16', 'open'),
--   ('2025-01-17', 'booked'),
--   ('2025-01-18', 'closed'),
--   ('2025-01-19', 'open');

-- דוגמת הזמנה
-- INSERT INTO bookings (date, guest_name, guest_phone, guest_email) VALUES
--   ('2025-01-17', 'משה כהן', '050-1234567', 'moshe@example.com');

-- =====================================================
-- הוראות התקנה
-- =====================================================
-- 1. הרץ את כל הקובץ הזה ב-Supabase SQL Editor
-- 2. העתק את ה-URL וה-anon key מההגדרות
-- 3. הוסף ל-.env.local
-- 4. הרץ npm run dev

