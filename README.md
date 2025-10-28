# 🏕️ מערכת הזמנות צימר

מערכת פשוטה, יפה וידידותית להזמנת ימים בצימר - עם אפשרות עריכה וביטול הזמנות ציבורית!

## ✨ תכונות

### 👥 עמוד ציבורי (`/`)
- 📅 לוח שנה בעברית (RTL) עם 3 צבעים
- 🟢 **ירוק** = יום פנוי (לחיצה תפתח טופס הזמנה)
- 🔴 **אדום** = יום מוזמן (לחיצה תאפשר עריכה או ביטול)
- ⚪ **אפור** = יום סגור (לא ניתן להזמין)
- 🔐 **זיהוי משתמשים לפי טלפון** (localStorage)
- 👑 **מנהלים** - יכולים לערוך ולמחוק הכל
- 👤 **משתמשים רגילים** - רק את שלהם
- ✏️ עריכת הזמנות קיימות (רק שלך או כמנהל)
- ❌ ביטול הזמנות (עם אישור)
- 📖 ספר אורחים (כתיבת הודעות + מחיקה)
- ⚡ **עדכונים בזמן אמת** (Realtime!)
- 📱 רספונסיבי מלא
- 🎨 תמונת רקע יפה עם שקיפויות

### 🛠️ עמוד ניהול (`/admin`)
- 🔒 כניסה עם סיסמה פשוטה: `fatlady`
- 📊 סטטיסטיקות בזמן אמת
- ☑️ **צ'קבוקס "בחר את כל החודש"**
- 🟢 פתיחת ימים מרובים
- 🔴 סגירת ימים מרובים (מדלג על מוזמנים)
- 🎯 בחירה ונקיה של ימים
- 🚪 התנתקות

## 🛠️ טכנולוגיות

- **Next.js 14** (App Router)
- **TypeScript** (strict mode)
- **Tailwind CSS** (עיצוב מודרני)
- **Supabase** (PostgreSQL + RLS)
- **react-day-picker** (לוח שנה)
- **date-fns** (עבודה עם תאריכים)

## 📋 דרישות מקדימות

- Node.js 18+
- חשבון Supabase (חינם)
- npm או yarn

## 🚀 התקנה מהירה

### 1. שכפול והתקנה

```bash
cd cabin-booking
npm install
```

### 2. הגדרת Supabase

1. צור פרויקט ב-[Supabase](https://supabase.com/dashboard)
2. עבור ל-**SQL Editor** והרץ את `supabase/schema.sql`
3. העתק URL ו-anon key מ-**Settings** > **API**

### 3. קובץ סביבה

צור `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
```

### 4. תמונת רקע

הוסף תמונה: `public/cabin-background.png`

**המלצות**:
- תמונת קרוואן/צימר ליד אגם או טבע
- 1920x1080 או יותר
- PNG או JPG (מקס 2MB)

**מקורות תמונות חינמיות**:
- [Unsplash](https://unsplash.com/s/photos/cabin-lake)
- [Pexels](https://www.pexels.com/search/cabin/)
- [Pixabay](https://pixabay.com/images/search/camping/)

### 5. הפעלת Realtime (חשוב!)

עבור ל-Supabase Dashboard → **Database** → **Table Editor**  
בחר כל טבלה והפעל **Enable Realtime**:
- ✅ `calendar`
- ✅ `bookings`
- ✅ `guestbook`

**תיעוד מלא:** `SUPABASE-REALTIME-SETUP.md`

### 6. הגדרת ניהול משתמשים (חשוב!)

הרץ SQL ב-Supabase כדי ליצור את טבלת המנהלים:

```sql
-- הוספת guest_phone לספר אורחים
ALTER TABLE guestbook 
ADD COLUMN IF NOT EXISTS guest_phone VARCHAR(20) NOT NULL DEFAULT 'אנונימי';

-- טבלת מנהלים
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- הוספת המנהלים (עדכן את הטלפונים!)
INSERT INTO admins (phone, name) VALUES
  ('052-8891082', 'דן - מנהל ראשי'),
  ('052-5420326', 'סיון עוז - מנהל')
ON CONFLICT (phone) DO NOTHING;

-- RLS
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read admins" ON admins
  FOR SELECT USING (true);
```

**תיעוד מלא:** `USER-MANAGEMENT-SETUP.md`

### 7. הרצה!

```bash
npm run dev
```

פתח: [http://localhost:3000](http://localhost:3000)

## 📁 מבנה הפרויקט

```
cabin-booking/
├── public/
│   └── cabin-background.png    # תמונת רקע (הוסף!)
├── src/
│   ├── app/
│   │   ├── page.tsx            # עמוד ציבורי
│   │   ├── admin/page.tsx      # עמוד ניהול
│   │   ├── layout.tsx          # Layout + RTL
│   │   └── globals.css         # סטיילים + שקיפויות
│   ├── components/
│   │   ├── BookingForm.tsx     # טופס הזמנה חדשה
│   │   ├── EditBookingForm.tsx # טופס עריכה + ביטול
│   │   ├── Modal.tsx           # מודאל גנרי
│   │   ├── Toast.tsx           # הודעות
│   │   └── LoadingSpinner.tsx
│   ├── lib/
│   │   ├── supabase.ts         # Supabase client
│   │   ├── utils.ts            # פונקציות עזר
│   │   └── constants.ts        # סיסמה + auth
│   └── types/
│       └── database.ts         # TypeScript types
├── supabase/
│   └── schema.sql              # סכמת DB
└── package.json
```

## 🔐 אבטחה ומשתמשים

### 👥 ניהול משתמשים

המערכת מזהה משתמשים לפי **מספר טלפון** (נשמר ב-localStorage):

**שני סוגי משתמשים:**
1. **👑 מנהלים** - יכולים לערוך/למחוק הכל (טלפונים בטבלת `admins`)
2. **👤 משתמשים רגילים** - רק את ההזמנות/הודעות שלהם

**זרימה:**
1. משתמש ממלא טופס הזמנה → הטלפון נשמר
2. בפעם הבאה המערכת מזהה אותו אוטומטית
3. יכול לערוך רק את ההזמנות שביצע (אלא אם הוא מנהל)

**להוסיף/להסיר מנהלים:** ראה `USER-MANAGEMENT-SETUP.md`

### 🔒 סיסמת מנהל דשבורד

**סיסמת `/admin`**: `fatlady` (מוגדרת ב-`src/lib/constants.ts`)

### שמירת מצב
- **Admin**: sessionStorage (נמחק בסגירת טאב)
- **משתמש**: localStorage (נשאר עד התנתקות)

### לשנות סיסמת דשבורד
ערוך `src/lib/constants.ts`:

```typescript
export const ADMIN_PASSWORD = 'your-new-password';
```

## 🗄️ מסד נתונים

### טבלאות

**calendar**
```sql
date       DATE PRIMARY KEY
status     'closed' | 'open' | 'booked'
```

**bookings**
```sql
id           UUID
date         DATE (FK → calendar)
guest_name   TEXT
guest_phone  TEXT
guest_email  TEXT (optional)
```

**guestbook**
```sql
id           UUID PRIMARY KEY
guest_name   VARCHAR(100)
guest_phone  VARCHAR(20)  -- NEW!
message      TEXT
created_at   TIMESTAMPTZ
```

**admins** (NEW!)
```sql
id           UUID PRIMARY KEY
phone        VARCHAR(20) UNIQUE
name         VARCHAR(100)
created_at   TIMESTAMPTZ
```

### RLS (Row Level Security)
- ✅ גישה מלאה לכולם (public) ל-calendar, bookings, guestbook
- ✅ קריאה בלבד ל-admins (כדי לבדוק מי מנהל)
- פשוט וללא סיבוכים
- מתאים למערכת קטנה

## 🎨 עיצוב

### צבעים
- **ירוק** (`#10b981`) - ימים פנויים
- **אדום** (`#ef4444`) - ימים מוזמנים
- **אפור** - ימים סגורים

### שקיפויות
- רקע כללי: **50%** לבן
- קלפים: **40%** לבן
- הדר: **98%** עם blur
- מודאלים: **99%** עם blur חזק

### חצי ניווט (RTL)
- **←** (שמאל) = חודש קודם
- **→** (ימין) = חודש הבא

## 🎯 שימוש

### משתמש רגיל

1. פתח את העמוד הראשי
2. **יום ירוק** → לחץ להזמנה חדשה
3. **יום אדום** → לחץ לעריכה או ביטול
4. מלא את הטופס ושלח

### מנהל

1. עבור ל-`/admin`
2. הזן סיסמה: `fatlady`
3. בחר ימים (או סמן "בחר את כל החודש")
4. לחץ "פתח ימים" או "סגור ימים"
5. התנתק בסיום

## ✅ בדיקות

### עמוד ציבורי
- [ ] לוח שנה בעברית עם חצים נכונים
- [ ] לחיצה על ירוק פותחת טופס הזמנה
- [ ] הזמנה עובדת והיום הופך לאדום
- [ ] לחיצה על אדום פותחת עריכה
- [ ] עריכה עובדת
- [ ] ביטול עם אישור עובד והיום חוזר לירוק
- [ ] תמונת רקע נראית עם שקיפויות

### עמוד ניהול
- [ ] כניסה עם "fatlady" עובדת
- [ ] סטטיסטיקות נכונות
- [ ] צ'קבוקס "בחר הכל" עובד
- [ ] פתיחת ימים עובדת
- [ ] סגירת ימים (לא מאפשר לסגור מוזמנים)
- [ ] התנתקות עובדת

## 🐛 פתרון בעיות

### אין תמונת רקע
הוסף `public/cabin-background.png`. אם לא, הרקע יהיה לבן.

### חצים הפוכים
נבדק! ה-CSS מטפל ב-RTL: ← קודם, → הבא.

### סיסמה לא עובדת
הסיסמה היא: `fatlady` (אותיות קטנות, אנגלית).

### Supabase errors
וודא ש-`.env.local` עם המפתחות הנכונים.

### לא רואה ימים
המנהל צריך לפתוח ימים דרך `/admin`.

## 🚀 פריסה (Deployment)

### Vercel (מומלץ)

1. חבר את הריפוזיטורי ל-[Vercel](https://vercel.com)
2. הוסף Environment Variables (מ-`.env.local`)
3. Deploy!

### Netlify

1. חבר ריפוזיטורי
2. Build command: `npm run build`
3. Publish directory: `.next`
4. הוסף Environment Variables

## 📝 רישיון

MIT - חופשי לשימוש ושינוי

## 🤝 תמיכה

נתקעת? שאלות?
- בדוק את התיעוד שוב
- בדוק את `supabase/schema.sql` שהורץ כראוי
- וודא שה-`.env.local` תקין

---

## 🚀 Deploy

הפרויקט מוגדר לפרסום אוטומטי ל-`ahuzat-haela/beeri`:

```bash
npm run deploy
```

הסקריפט יעשה:
1. ✅ Pull מ-gh-pages
2. ✅ Build של הפרויקט
3. ✅ העתקה ל-`beeri/`
4. ✅ Commit ו-Push

**תיעוד מלא:** ראה `DEPLOY-INSTRUCTIONS.md`

---

**נבנה עם ❤️ בעברית עם Next.js, TypeScript, Tailwind ו-Supabase**

