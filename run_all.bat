@echo off
title NSRMS - Start Backend & Frontend
color 0A

echo ===================================================
echo   NGU SON RESORT & SPA MANAGEMENT SYSTEM (NSRMS)
echo   Khoi chay ca Backend (Spring Boot) va Frontend (Vite)
echo ===================================================
echo.

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
if exist "Backend\target\smms-0.0.1-SNAPSHOT.jar" (
    start "NSRMS Backend - Spring Boot" cmd /c "cd Backend && title Backend - Spring Boot && java -jar target\smms-0.0.1-SNAPSHOT.jar"
) else (
    echo [WARNING] Khong tim thay file JAR trong Backend/target.
    echo Thu chay bang lenh 'mvn spring-boot:run' neu he thong co Maven...
    start "NSRMS Backend (Maven)" cmd /c "cd Backend && title Backend - Spring Boot && mvn spring-boot:run"
)

:: Khoi dong Frontend (Vite) trong mot cua so CMD moi
echo 2. Dang khoi dong Frontend (Vite)...
start "NSRMS Frontend - Vite" cmd /c "title Frontend - Vite && npm run dev"

echo.
echo ===================================================
echo [SUCCESS] Da kich hoat thanh cong lenh chay cho ca 2 service!
echo Cac cua so terminal doc lap da duoc mo de chay song song Backend & Frontend.
echo ===================================================
echo.
pause
