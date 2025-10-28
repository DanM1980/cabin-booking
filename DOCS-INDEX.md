# 📚 מדריך תיעוד הפרויקט

## 🎯 מסמכים עיקריים

### 🏠 התחלה
- **[README.md](README.md)** - מדריך ראשי מלא
  - התקנה והגדרה
  - תכונות המערכת
  - טכנולוגיות
  - פתרון בעיות

### ⚡ התחלה מהירה
- **[QUICK-START-USER-MANAGEMENT.md](QUICK-START-USER-MANAGEMENT.md)** - 3 שלבים לתפעול מהיר
  - הרצת SQL
  - בדיקות
  - שאלות נפוצות

---

## 🔧 הגדרות ותצורה

### 🔐 ניהול משתמשים
- **[USER-MANAGEMENT-SETUP.md](USER-MANAGEMENT-SETUP.md)** - מדריך מקיף
  - מערכת המנהלים (👑)
  - זיהוי משתמשים
  - הרשאות
  - UI/UX
  - אבטחה

### ⚡ Realtime
- **[SUPABASE-REALTIME-SETUP.md](SUPABASE-REALTIME-SETUP.md)** - הפעלת עדכונים בזמן אמת
  - הוראות הפעלה
  - טבלאות לסנכרון
  - פתרון בעיות

### 🌐 סביבה
- **[env.example](env.example)** - תבנית קובץ סביבה
  - משתני Supabase
  - הוראות שימוש

---

## 🚀 פריסה (Deployment)

### 📦 הוראות Deploy
- **[DEPLOY-INSTRUCTIONS.md](DEPLOY-INSTRUCTIONS.md)** - מדריך מלא לפריסה
  - שימוש ב-`npm run deploy`
  - מה קורה בכל שלב
  - פתרון בעיות
  - GitHub Pages

---

## 🗄️ מסד נתונים

### 📊 Schema
- **[supabase/schema.sql](supabase/schema.sql)** - סכמת DB המלאה
  - טבלאות: `calendar`, `bookings`, `guestbook`, `admins`
  - RLS Policies
  - Functions
  - Triggers

---

## 📁 מבנה הפרויקט

```
cabin-booking/
├── src/
│   ├── app/
│   │   ├── page.tsx           # עמוד ראשי (לוח שנה)
│   │   ├── admin/page.tsx     # ממשק ניהול
│   │   ├── layout.tsx         # Layout ראשי + RTL
│   │   └── globals.css        # סטיילים גלובליים
│   ├── components/
│   │   ├── BookingForm.tsx
│   │   ├── EditBookingForm.tsx
│   │   ├── GuestbookForm.tsx
│   │   ├── GuestbookEntry.tsx
│   │   ├── LoginModal.tsx     # 👋 מסך התחברות Lazy
│   │   ├── Modal.tsx
│   │   ├── Toast.tsx
│   │   └── LoadingSpinner.tsx
│   ├── lib/
│   │   ├── supabase.ts        # Supabase client
│   │   ├── utils.ts           # פונקציות עזר
│   │   └── constants.ts       # קבועים (סיסמה)
│   └── types/
│       └── database.ts        # TypeScript types
├── supabase/
│   └── schema.sql             # סכמת DB
├── public/
│   └── cabin-background.png   # תמונת רקע
└── deploy.bat                 # סקריפט deploy אוטומטי
```

---

## 🔑 מידע חשוב

### 🔒 סיסמאות וקבועים
- **Admin Password**: `fatlady` (ב-`src/lib/constants.ts`)
- **מנהלים**: 
  - 052-8891082 (דן - מנהל ראשי)
  - 052-5420326 (סיון עוז - מנהל)

### 🌐 URLs
- **Development**: http://localhost:3000
- **Production**: https://ellaestate.com/beeri
- **Admin Panel**: `/admin`

---

## ❓ עזרה מהירה

### בעיה נפוצה 1: לא רואה עדכונים בזמן אמת
➡️ קרא: [SUPABASE-REALTIME-SETUP.md](SUPABASE-REALTIME-SETUP.md)

### בעיה נפוצה 2: Deploy לא עובד
➡️ קרא: [DEPLOY-INSTRUCTIONS.md](DEPLOY-INSTRUCTIONS.md) - סעיף "פתרון בעיות"

### בעיה נפוצה 3: משתמש לא מזוהה כמנהל
➡️ קרא: [USER-MANAGEMENT-SETUP.md](USER-MANAGEMENT-SETUP.md) - סעיף "ניהול מנהלים"

---

## 📞 תמיכה

נתקעת? בדוק את המסמכים לפי הסדר:
1. README.md (כללי)
2. המדריך הספציפי לנושא
3. QUICK-START למידע מהיר

