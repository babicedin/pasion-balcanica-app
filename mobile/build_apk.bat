@echo off
REM Build a release APK for Pasion Balcanica and copy it to the desktop
REM workspace folder so you can sideload it onto your phone.

setlocal
cd /d "%~dp0"

echo === flutter pub get ===
call flutter pub get
if errorlevel 1 goto :error

echo.
echo === flutter build apk --release ===
call flutter build apk --release
if errorlevel 1 goto :error

set "OUT=%USERPROFILE%\Desktop\PASION BALCANICA APP"
if not exist "%OUT%" mkdir "%OUT%"

echo.
echo === Copying APK ===
copy /Y "build\app\outputs\flutter-apk\app-release.apk" "%OUT%\Pasion Balcanica.apk"
if errorlevel 1 goto :error

echo.
echo Done. APK is at:
echo   %OUT%\Pasion Balcanica.apk
echo.
pause
exit /b 0

:error
echo.
echo *** Build failed. Scroll up for the error. ***
pause
exit /b 1
