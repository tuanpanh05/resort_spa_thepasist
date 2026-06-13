@echo off
title NSRMS - Start Backend & Frontend
color 0A

echo ===================================================
echo   NGU SON RESORT & SPA MANAGEMENT SYSTEM (NSRMS)
echo   Khoi chay ca Backend (Spring Boot) va Frontend (Vite)
echo ===================================================
echo.

:: Load environment variables from .env if it exists
if exist .env (
    echo [*] Dang nap cac bien moi truong tu file .env...
    for /f "usebackq delims=" %%x in (".env") do (
        echo %%x | findstr /r "^[a-zA-Z_]" >nul
        if not errorlevel 1 (
            for /f "tokens=1,* delims==" %%i in ("%%x") do (
                set "%%i=%%j"
            )
        )
    )
)

:: Kiem tra xem Java da duoc cai dat hay chua
where java >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Java khong duoc tim thay. Vui long cai dat JDK 21+ va cau hinh PATH.
    pause
    exit /b
)

:: Kiem tra xem Node.js / NPM da duoc cai dat hay chua
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js / NPM khong duoc tim thay. Vui long cai dat va cau hinh PATH.
    pause
    exit /b
)

:: Khoi dong Backend trong mot cua so CMD moi
echo 1. Dang khoi dong Backend (Spring Boot)...
if exist "05-Development\backend\target\smms-0.0.1-SNAPSHOT.jar" (
    start "NSRMS Backend - Spring Boot" cmd /c "cd 05-Development\backend && title Backend - Spring Boot && java -jar target\smms-0.0.1-SNAPSHOT.jar"
) else (
    echo [WARNING] Khong tim thay file JAR trong 05-Development/backend/target.
    echo Thu chay bang lenh 'mvn spring-boot:run' neu he thong co Maven...
    start "NSRMS Backend (Maven)" cmd /c "cd 05-Development\backend && title Backend - Spring Boot && mvn spring-boot:run"
)

:: Khoi dong Frontend (Vite) trong mot cua so CMD moi
echo 2. Dang khoi dong Frontend (Vite)...
start "NSRMS Frontend - Vite" cmd /c "cd 05-Development\frontend && title Frontend - Vite && npm run dev"

echo.
echo ===================================================
echo [SUCCESS] Da kich hoat thanh cong lenh chay cho ca 2 service!
echo Cac cua so terminal doc lap da duoc mo de chay song song Backend & Frontend.
echo ===================================================
echo.
pause
