@echo off
REM ========================================
REM  Deploy Script - Cabin Booking to Beeri
REM ========================================

echo.
echo ========================================
echo   Deploy to ahuzat-haela/beeri
echo ========================================
echo.

REM הגדרות
set TARGET_PROJECT=C:\Users\DanM\Documents\React\Ella\ahuzat-haela
set TARGET_SUBDIR=beeri

echo [1/6] Checking target project...
if not exist "%TARGET_PROJECT%" (
    echo ERROR: Target project not found at %TARGET_PROJECT%
    exit /b 1
)

echo [2/6] Pulling latest changes from remote...
cd /d "%TARGET_PROJECT%"
git pull origin gh-pages
if errorlevel 1 (
    echo ERROR: Failed to pull from remote
    exit /b 1
)

echo [3/6] Building current project...
cd /d "%~dp0"
call npm run build
if errorlevel 1 (
    echo ERROR: Build failed
    exit /b 1
)

echo [4/6] Cleaning target directory...
if exist "%TARGET_PROJECT%\%TARGET_SUBDIR%" (
    rmdir /s /q "%TARGET_PROJECT%\%TARGET_SUBDIR%"
)

echo [5/6] Copying build files...
xcopy /E /I /Y "out" "%TARGET_PROJECT%\%TARGET_SUBDIR%"
if errorlevel 1 (
    echo ERROR: Failed to copy files
    exit /b 1
)

echo [6/6] Committing and pushing changes...
cd /d "%TARGET_PROJECT%"
git add %TARGET_SUBDIR%
git commit -m "Update beeri - cabin booking system"
git push origin gh-pages
if errorlevel 1 (
    echo ERROR: Failed to push to remote
    exit /b 1
)

echo.
echo ========================================
echo   Deploy completed successfully!
echo ========================================
echo.
echo The site should be live at:
echo https://ellaestate.com/beeri
echo.

cd /d "%~dp0"

