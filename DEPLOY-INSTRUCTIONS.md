# 🚀 הוראות Deploy לפרויקט ahuzat-haela

## שימוש מהיר

פשוט הרץ:
```bash
npm run deploy
```

זהו! הסקריפט יעשה הכל בשבילך.

---

## מה הסקריפט עושה?

### שלב 1: בדיקה
✓ בודק שהפרויקט היעד קיים

### שלב 2: Pull
✓ מושך את הגרסה האחרונה מ-`gh-pages` branch

### שלב 3: Build
✓ בונה את פרויקט cabin-booking (יוצר `out/`)

### שלב 4: ניקוי
✓ מוחק את התיקייה `beeri/` הישנה

### שלב 5: העתקה
✓ מעתיק את `out/` → `ahuzat-haela/beeri/`

### שלב 6: Commit & Push
✓ עושה commit ו-push ל-`gh-pages`

---

## בדיקה לפני Deploy

אם אתה רוצה רק לוודא שה-build עובד:
```bash
npm run deploy:check
```

---

## נתיבים

| מה | איפה |
|---|---|
| **פרויקט זה** | `C:\Users\DanM\Documents\React\cabin-booking` |
| **פרויקט יעד** | `C:\Users\DanM\Documents\React\Ella\ahuzat-haela` |
| **תת-ספרייה** | `beeri/` |
| **ענף** | `gh-pages` |
| **URL בסיס** | `/beeri` |

---

## פתרון בעיות

### שגיאה: "Target project not found"
**פתרון:** ודא שהנתיב `C:\Users\DanM\Documents\React\Ella\ahuzat-haela` נכון

### שגיאה: "Failed to pull from remote"
**פתרון:** 
- בדוק חיבור לאינטרנט
- ודא שאין שינויים לא שמורים בפרויקט היעד
- הרץ `git status` בפרויקט היעד

### שגיאה: "Build failed"
**פתרון:**
- בדוק שכל ה-dependencies מותקנים (`npm install`)
- הרץ `npm run build` לראות את השגיאה המדויקת

### שגיאה: "Failed to push to remote"
**פתרון:**
- ודא שיש לך הרשאות push ל-repository
- בדוק שלא התקבלו שינויים חדשים (conflict)

---

## שינוי הגדרות

### לשנות שם תת-ספרייה:
ערוך את `deploy.bat` שורה 13:
```batch
set TARGET_SUBDIR=new-name
```

וגם את `next.config.js`:
```javascript
basePath: '/new-name',
```

### לשנות פרויקט יעד:
ערוך את `deploy.bat` שורה 12:
```batch
set TARGET_PROJECT=C:\path\to\your\project
```

---

## Deploy ידני (מתקדם)

אם אתה רוצה לעשות deploy ידני:

```bash
# 1. בנה את הפרויקט
npm run build

# 2. עבור לפרויקט היעד
cd C:\Users\DanM\Documents\React\Ella\ahuzat-haela

# 3. משוך עדכונים
git pull origin gh-pages

# 4. מחק את beeri הישן
rmdir /s /q beeri

# 5. העתק את out
xcopy /E /I /Y C:\Users\DanM\Documents\React\cabin-booking\out beeri

# 6. Commit & Push
git add beeri
git commit -m "Update beeri"
git push origin gh-pages
```

---

## תזמון אוטומטי (אופציונלי)

אם אתה רוצה deploy אוטומטי כל פעם שיש commit:

1. הוסף GitHub Action
2. או השתמש ב-Git hooks
3. או תזמן עם Task Scheduler

---

## שאלות נפוצות

**Q: האם אפשר לעשות deploy בלי לעשות push?**  
A: כן, הסר את השורות האחרונות מ-`deploy.bat`

**Q: איך לראות מה שונה לפני push?**  
A: הרץ `git diff` בפרויקט היעד לפני ה-commit

**Q: מה קורה אם יש conflicts?**  
A: הסקריפט יכשל ותצטרך לפתור ידנית

---

## סיום

כל פעם שאתה עושה שינויים בפרויקט cabin-booking ורוצה לעדכן את האתר:

```bash
npm run deploy
```

זהו! 🎉

