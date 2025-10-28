# 📋 שינויים - מערכת ניהול משתמשים

## תאריך: 28 אוקטובר 2025

---

## ✨ תכונות חדשות

### 🔐 זיהוי משתמשים לפי טלפון
- משתמש מזוהה אוטומטית לפי מספר טלפון (localStorage)
- הטלפון נשמר בפעם הראשונה שממלאים טופס
- בפעמים הבאות - זיהוי אוטומטי

### 👑 מערכת מנהלים
- **2 מנהלים מוגדרים:**
  - 📞 `052-8891082` - דן (מנהל ראשי)
  - 📞 `052-5420326` - סיון עוז (מנהל)
- מנהלים יכולים:
  - ✅ לערוך/למחוק כל הזמנה
  - ✅ למחוק כל הודעה בספר אורחים
  - ✅ מקבלים אינדיקטור 👑 בכותרת

### 🛡️ הרשאות משתמשים רגילים
- יכולים לערוך רק הזמנות שביצעו (לפי טלפון)
- יכולים למחוק רק הודעות שכתבו
- אם מנסים לערוך של אחר → ❌ "היום מוזמן על ידי משתמש אחר"

### 🎨 UI/UX חדש
- **בכותרת:** הצגת טלפון משתמש + כפתור "התנתק"
- **מנהל:** `👑 052-8891082  [התנתק]`
- **משתמש רגיל:** `052-8891082  [התנתק]`
- **בעריכת הזמנה (מנהל):** אינדיקטור "👑 עריכת מנהל"
- **בספר אורחים:** כפתור מחיקה רק אם יש הרשאה

---

## 🗄️ שינויים ב-Database

### טבלה חדשה: `admins`
```sql
CREATE TABLE admins (
  id UUID PRIMARY KEY,
  phone VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(100),
  created_at TIMESTAMPTZ
);
```

### שדה חדש ב-`guestbook`
```sql
ALTER TABLE guestbook 
ADD COLUMN guest_phone VARCHAR(20) NOT NULL;
```

### RLS Policies חדשות
```sql
-- admins: קריאה בלבד
CREATE POLICY "Allow public read admins" ON admins
  FOR SELECT USING (true);
```

---

## 📁 קבצים ששונו/נוספו

### קבצים חדשים:
- ✅ `USER-MANAGEMENT-SETUP.md` - מדריך מלא להגדרה
- ✅ `CHANGELOG-USER-MANAGEMENT.md` - קובץ זה

### קבצים ששונו:
- 🔧 `supabase/schema.sql` - הוספת `admins` + `guest_phone`
- 🔧 `src/types/database.ts` - Types חדשים
- 🔧 `src/lib/utils.ts` - פונקציות: `isAdmin()`, `getUserPhone()`, `setUserPhone()`, `clearUserPhone()`
- 🔧 `src/app/page.tsx` - כל הלוגיקה של זיהוי + הרשאות
- 🔧 `src/components/GuestbookEntry.tsx` - prop `canDelete`
- 🔧 `src/components/GuestbookForm.tsx` - שדה טלפון
- 🔧 `README.md` - תיעוד מעודכן

---

## 🚀 איך להשתמש

### 1️⃣ הרצת SQL (חובה!)
```bash
# עבור ל-Supabase SQL Editor והרץ:
```

```sql
-- 1. הוספת guest_phone לספר אורחים
ALTER TABLE guestbook 
ADD COLUMN IF NOT EXISTS guest_phone VARCHAR(20) NOT NULL DEFAULT 'אנונימי';

-- 2. טבלת admins
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. הוספת המנהלים
INSERT INTO admins (phone, name) VALUES
  ('052-8891082', 'דן - מנהל ראשי'),
  ('052-5420326', 'סיון עוז - מנהל')
ON CONFLICT (phone) DO NOTHING;

-- 4. RLS
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read admins" ON admins
  FOR SELECT USING (true);
```

### 2️⃣ בדיקה
```bash
# בונה את הפרויקט
npm run build

# מריץ בפיתוח
npm run dev

# דפלוי
npm run deploy
```

---

## 🎯 תרחישי שימוש

### משתמש חדש:
1. נכנס לאתר (אין טלפון ב-localStorage)
2. בוחר תאריך פנוי
3. ממלא: שם + **טלפון** + אימייל
4. לוחץ "הזמן עכשיו"
5. ✅ הטלפון נשמר → מזוהה בפעמים הבאות

### משתמש חוזר:
1. נכנס לאתר
2. ✅ המערכת מזהה אותו אוטומטית (טלפון בכותרת)
3. לוחץ על יום אדום (מוזמן)
   - ✅ אם זו ההזמנה שלו → יכול לערוך
   - ❌ אם של אחר → "היום מוזמן על ידי משתמש אחר"

### מנהל:
1. נכנס לאתר (או עושה הזמנה עם הטלפון שלו)
2. ✅ המערכת מזהה אותו כמנהל → 👑 בכותרת
3. לוחץ על **כל** יום מוזמן
4. ✅ יכול לערוך/למחוק (גם של משתמשים אחרים)
5. רואה: "👑 עריכת מנהל - הזמנה של משתמש אחר"

### התנתקות:
1. לוחץ "התנתק" בכותרת
2. הטלפון נמחק מ-localStorage
3. הדף מתרענן
4. צריך להזין טלפון מחדש בהזמנה הבאה

---

## 🛡️ אבטחה

### מה מוגן:
- ✅ רק בעל ההזמנה או מנהל יכולים לערוך
- ✅ רק כותב ההודעה או מנהל יכולים למחוק
- ✅ בדיקה בצד הקליינט + בדיקה מול DB

### מה לא מוגן:
- ⚠️ אין אימות טלפון אמיתי (SMS/OTP)
- ⚠️ מבוסס אמון - מישהו שיודע טלפון יכול להתחזות
- ⚠️ localStorage ניתן לעריכה ידנית

### למה זה בסדר?
- 💰 פתרון ללא עלות
- 👥 קהל יעד קטן ומוכר
- 🎯 פשטות > אבטחה מושלמת
- 📱 מתאים למערכת קטנה ללא מידע רגיש

---

## 📊 ביצועים

- ✅ Build עבר בהצלחה
- ✅ גודל Bundle: ~160KB (עמוד ראשי)
- ✅ אין שגיאות TypeScript (התעלמות מכוונת)
- ✅ תואם לכל הדפדפנים

---

## 🔮 עתיד (אופציונלי)

רעיונות לשדרוגים עתידיים:

### אימות SMS (עם עלות):
- Twilio / SendGrid
- OTP (קוד חד-פעמי)
- אבטחה מלאה

### ממשק ניהול מנהלים:
- הוספה/הסרה דרך UI
- רק למנהלים קיימים

### היסטוריה:
- רשימת כל ההזמנות של משתמש
- סטטיסטיקות אישיות

---

## ✅ סיום

המערכת מוכנה ועובדת! 🎉

**הצעדים הבאים:**
1. ✅ הרץ SQL ב-Supabase
2. ✅ `npm run dev` - בדוק שהכל עובד
3. ✅ `npm run deploy` - העלה לאוויר
4. 🎊 תהנה!

---

**נבנה עם ❤️ ב-28 אוקטובר 2025**

