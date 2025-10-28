# 🚀 התחלה מהירה - 5 דקות

## צעד 1: התקנה (1 דקה)

```bash
cd cabin-booking
npm install
```

## צעד 2: Supabase (2 דקות)

### A. צור פרויקט
1. עבור ל-https://supabase.com/dashboard
2. לחץ **New Project**
3. בחר שם וסיסמה

### B. הרץ סכמה
1. לחץ **SQL Editor** בצד
2. לחץ **New query**
3. העתק את **כל** התוכן מ-`supabase/schema.sql`
4. הדבק והרץ (**Run**)

### C. העתק מפתחות
1. עבור ל-**Settings** (⚙️) > **API**
2. העתק:
   - **Project URL**
   - **anon/public key**

## צעד 3: קובץ סביבה (30 שניות)

צור `.env.local` בתיקיית הפרויקט:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
```

## צעד 4: תמונת רקע (אופציונלי, 1 דקה)

הורד תמונת צימר/קרוואן מ:
- [Unsplash](https://unsplash.com/s/photos/cabin-lake)
- [Pexels](https://www.pexels.com/search/cabin/)

שמור בשם: `public/cabin-background.png`

## צעד 5: הרצה! (30 שניות)

```bash
npm run dev
```

פתח: **http://localhost:3000**

---

## ✅ בדיקה מהירה

### 1. עמוד ראשי
- פתח http://localhost:3000
- אמור לראות לוח שנה בעברית
- (אבל עדיין אין ימים פנויים)

### 2. עמוד ניהול
- פתח http://localhost:3000/admin
- הזן סיסמה: **fatlady**
- בחר ימים (או סמן "בחר את כל החודש")
- לחץ **"פתח ימים נבחרים"**

### 3. חזור לעמוד ראשי
- רענן את הדף
- אמור לראות ימים **ירוקים**!
- לחץ על יום ירוק
- מלא טופס ושלח
- היום אמור להפוך **אדום**
- לחץ על יום אדום
- אפשר לערוך או לבטל!

---

## 🎉 זהו! המערכת פועלת!

### צעדים הבאים:
- קרא את [README.md](README.md) המלא
- התאם אישית (צבעים, טקסטים)
- פרוס ל-Vercel (ראה README)

---

## 🆘 בעיות?

### "Missing Supabase environment variables"
וודא ש-`.env.local` קיים ותקין.

### "Failed to fetch" / שגיאות Supabase
וודא שהסכמה (`schema.sql`) רצה בהצלחה ב-SQL Editor.

### לא רואה ימים פנויים
המנהל צריך לפתוח ימים דרך `/admin` תחילה.

### סיסמה לא עובדת
הסיסמה היא: **fatlady** (אותיות קטנות באנגלית)

---

**זקוק לעזרה נוספת? קרא את README.md או בדוק את הקוד!**

