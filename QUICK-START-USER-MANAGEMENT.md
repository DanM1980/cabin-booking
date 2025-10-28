# ⚡ התחלה מהירה - ניהול משתמשים

## 🎯 מה השתנה?

עכשיו המערכת מזהה משתמשים לפי **טלפון** ויש **2 מנהלים** שיכולים לערוך הכל!

---

## 🚀 3 צעדים להפעלה

### 1️⃣ הרץ SQL ב-Supabase

פתח **Supabase SQL Editor** והדבק:

```sql
-- הוספת טלפון לספר אורחים
ALTER TABLE guestbook 
ADD COLUMN IF NOT EXISTS guest_phone VARCHAR(20) NOT NULL DEFAULT 'אנונימי';

-- טבלת מנהלים
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- שני המנהלים שלך
INSERT INTO admins (phone, name) VALUES
  ('052-8891082', 'דן - מנהל ראשי'),
  ('052-5420326', 'סיון עוז - מנהל')
ON CONFLICT (phone) DO NOTHING;

-- הרשאות
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read admins" ON admins
  FOR SELECT USING (true);
```

לחץ **Run** (Ctrl+Enter)

---

### 2️⃣ בנה ובדוק

```bash
npm run build
npm run dev
```

פתח: http://localhost:3000

---

### 3️⃣ העלה לאוויר

```bash
npm run deploy
```

---

## 🧪 איך לבדוק?

### בדיקה 1: כמשתמש רגיל
1. פתח את האתר
2. בחר תאריך פנוי
3. הזמן עם טלפון: `050-9999999`
4. רענן → אמור לראות `050-9999999 [התנתק]` בכותרת
5. נסה ללחוץ על יום מוזמן של מישהו אחר
6. ✅ אמור לקבל: "היום מוזמן על ידי משתמש אחר"

### בדיקה 2: כמנהל
1. נקה localStorage (Console → `localStorage.clear()`)
2. רענן את הדף
3. הזמן עם טלפון: `052-8891082`
4. אמור לראות `👑 052-8891082 [התנתק]`
5. לחץ על כל יום מוזמן
6. ✅ אמור לראות "👑 עריכת מנהל" ולהיות מסוגל לערוך

### בדיקה 3: ספר אורחים
1. כתוב הודעה (עם הטלפון שלך)
2. אמור לראות כפתור 🗑️ מחק
3. התנתק (`localStorage.clear()`)
4. רענן
5. ❌ כפתור המחיקה לא אמור להיראות
6. התחבר כמנהל
7. ✅ כפתור המחיקה אמור להופיע על **כל** ההודעות

---

## 👑 המנהלים שלך

- 📞 **052-8891082** - דן (מנהל ראשי)
- 📞 **052-5420326** - סיון עוז

שניהם יכולים:
- ✅ לערוך/למחוק כל הזמנה
- ✅ למחוק כל הודעה בספר אורחים

---

## ➕ להוסיף מנהל נוסף

Supabase SQL Editor:

```sql
INSERT INTO admins (phone, name) 
VALUES ('050-1234567', 'שם המנהל החדש');
```

---

## ➖ להסיר מנהל

```sql
DELETE FROM admins 
WHERE phone = '050-1234567';
```

---

## 🔧 בעיות נפוצות

### לא רואה 👑
- וודא שהטלפון נכון ב-DB
- בדוק Console (F12) לשגיאות
- רענן את הדף

### "היום מוזמן..." אבל זה אני!
- התנתק ורענן
- נקה localStorage: `localStorage.clear()`
- הזמן מחדש עם הטלפון הנכון

### כפתור מחיקה לא מופיע
- זה תקין! רק אם זו ההודעה שלך או שאתה מנהל

---

## 📚 תיעוד מלא

- **התקנה מפורטת:** `USER-MANAGEMENT-SETUP.md`
- **שינויים טכניים:** `CHANGELOG-USER-MANAGEMENT.md`
- **README כללי:** `README.md`

---

## ✅ זהו!

המערכת מוכנה! 🎉

משתמשים יזוהו אוטומטית, ומנהלים יקבלו 👑.

