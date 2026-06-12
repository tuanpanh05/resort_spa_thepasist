@echo off
title Ngu Son Resort - Khoi Dong Du An
color 0A

echo ==========================================================
echo               NGU SON RESORT - DEV RUNNER
echo ==========================================================
echo.
echo [*] Dang kiem tra moi truong he thong...

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

:: 1. Kiem tra Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    color 0C
    echo [ERROR] Node.js chua duoc cai dat hoac chua duoc them vao PATH!
    echo Vui long tai va cai dat Node.js tai: https://nodejs.org/
    pause
    exit /b
)
echo [OK] Node.js da duoc tim thay.

:: 2. Kiem tra Java
where java >nul 2>nul
if %errorlevel% neq 0 (
    color 0C
    echo [ERROR] Java JDK chua duoc cai dat hoac chua duoc them vao PATH!
    echo Vui long cai dat JDK 17 tro len va thiet lap bien moi truong JAVA_HOME.
    pause
    exit /b
)
echo [OK] Java JDK da duoc tim thay.

echo.
echo [*] Bat dau khoi dong cac server trong cua so rieng biet...
echo.

:: 3. Khoi dong Backend
echo [1/2] Dang khoi dong Backend (Spring Boot)...
start "Backend - Spring Boot (Port 8080)" cmd /k "cd backend && .\apache-maven-3.9.6\bin\mvn.cmd spring-boot:run"

:: 4. Khoi dong Frontend
echo [2/2] Dang khoi dong Frontend (Vite - React)...
start "Frontend - Vite (Port 5173)" cmd /k "cd frontend && npm run dev"

echo.
echo ==========================================================
echo [THANH CONG] Ca hai server da duoc mo trong cua so rieng!
echo - API Backend: http://localhost:8080/api
echo - Web Frontend: http://localhost:5173/
echo.
echo Luu y: Vui long giu cac cua so dang chay de lam viec.
echo ==========================================================
echo.
pause
