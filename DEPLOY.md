# 🚀 הנחיות Deploy

## תצורה נוכחית

הפרויקט מוגדר לעבוד בתת-ספרייה: **`/beeri`**

אם אתה רוצה נתיב אחר, שנה את `basePath` ב-`next.config.js`.

---

## אופציה 1: Deploy כתת-ספרייה בפרויקט קיים (GitHub)

### שלב 1: העתק קבצי Build

לאחר `npm run build`, העתק את תיקיית `.next` לפרויקט הראשי שלך בנתיב:
```
/your-main-project/cabin/.next
```

### שלב 2: הגדרות בפרויקט הראשי

אם הפרויקט הראשי הוא גם Next.js, תצטרך להגדיר rewrites או להשתמש ב-reverse proxy.

אם הפרויקט הראשי הוא סטטי או PHP/HTML:
1. בנה את הפרויקט: `npm run build`
2. הרץ `npm run export` (אם צריך export סטטי)
3. העתק את הקבצים ל-`/cabin` בפרויקט הראשי

---

## אופציה 2: Deploy נפרד ב-Vercel (מומלץ)

### שלב 1: התקן Vercel CLI
```bash
npm i -g vercel
```

### שלב 2: Login ל-Vercel
```bash
vercel login
```

### שלב 3: Deploy
```bash
vercel
```

### שלב 4: Custom Domain
- בממשק Vercel, הוסף custom domain
- הגדר subdomain: `cabin.yourdomain.com`

---

## אופציה 3: Deploy ל-Netlify

### דרך GitHub:
1. חבר את ה-repo ל-Netlify
2. הגדרות Build:
   - **Build Command:** `npm run build`
   - **Publish Directory:** `.next`
   - **Base Directory:** (השאר ריק או `/cabin` אם זה חלק מ-monorepo)

### Environment Variables (חשוב!):
הוסף ב-Netlify/Vercel:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

---

## אופציה 4: Deploy עצמאי (VPS/Shared Hosting)

### שלב 1: Build
```bash
npm run build
```

### שלב 2: התקן dependencies בשרת
```bash
npm ci --production
```

### שלב 3: הרץ בפרודקשן
```bash
npm start
```

או עם PM2:
```bash
pm2 start npm --name "cabin-booking" -- start
```

---

## שילוב עם Supabase

### חשוב! הגדר את משתני הסביבה:

#### Development (`.env.local`):
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

#### Production:
הגדר את אותם משתנים בפלטפורמת ה-hosting שלך (Vercel/Netlify/etc.)

---

## בדיקה לאחר Deploy

1. ✅ לוח השנה נטען
2. ✅ אפשר להוסיף הזמנה
3. ✅ ספר אורחים עובד
4. ✅ ממשק הניהול נגיש
5. ✅ התמונות נטענות (cabin-background.png)

---

## פתרון בעיות נפוצות

### בעיה: "Failed to fetch data"
**פתרון:** בדוק שמשתני הסביבה מוגדרים נכון בפרודקשן

### בעיה: תמונות לא נטענות
**פתרון:** ודא ש-`basePath` מוגדר נכון ב-`next.config.js`

### בעיה: 404 בניווט
**פתרון:** הוסף rewrites בשרת או ב-`vercel.json`/`netlify.toml`

---

## שאלות?

פתח issue ב-GitHub או צור קשר עם התמיכה.

