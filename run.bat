@echo off
title NGU SON RESORT - RUNNER
color 0B

echo =====================================================================
echo                NGU SON RESORT - BATCH RUNNER
echo =====================================================================
echo.

:: 1. Cấu hình JAVA_HOME và PATH để sử dụng JDK 21 (Tương thích 100% với Lombok)
set "EMBEDDED_JAVA=C:\Users\Administrator\.vscode\extensions\redhat.java-1.54.0-win32-x64\jre\21.0.10-win32-x86_64"
set "SYSTEM_JDK21=C:\Program Files\Java\jdk-21.0.11"
if not exist "%SYSTEM_JDK21%" set "SYSTEM_JDK21=C:\Program Files\Java\jdk-21.0.10"

if exist "%SYSTEM_JDK21%" (
    set "JAVA_HOME=%SYSTEM_JDK21%"
    set "PATH=%SYSTEM_JDK21%\bin;%PATH%"
    echo [*] Da thiet lap JAVA_HOME ve JDK 21 tai %SYSTEM_JDK21% de tranh crash Lombok.
) else if exist "%EMBEDDED_JAVA%" (
    set "JAVA_HOME=%EMBEDDED_JAVA%"
    set "PATH=%EMBEDDED_JAVA%\bin;%PATH%"
    echo [*] Da thiet lap JAVA_HOME ve JDK 21 tai %EMBEDDED_JAVA% de tranh crash Lombok.
) else (
    echo [!] Khong tim thay JDK 21. Se dung Java mac dinh.
)

:: 2. Đồng bộ file .env sang Frontend và Backend
echo [*] Dang dong bo file .env sang Frontend va Backend...
if exist ".env" (
    copy /Y ".env" "05-Development\frontend\.env" >nul
    copy /Y ".env" "05-Development\backend\.env" >nul
    echo [OK] Da dong bo file .env!
    
    :: Nạp các biến môi trường vào tiến trình hiện tại
    for /F "usebackq eol=# tokens=1,* delims==" %%A in (".env") do (
        set "%%A=%%B"
    )
) else (
    echo [!] Khong tim thay file .env o thu muc goc!
    color 0C
)

echo [*] Don dep tien trinh cu tren port 8080 va 5173...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8080 ^| findstr LISTENING') do (
    taskkill /F /PID %%a >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5173 ^| findstr LISTENING') do (
    taskkill /F /PID %%a >nul 2>&1
)
echo [OK] Da giai phong port!
echo.

:: 3. Khởi chạy Backend trong cửa sổ CMD mới (Kế thừa biến môi trường JAVA_HOME/PATH)
echo [*] Dang khoi dong Backend (Spring Boot)...
set "MVN_CMD=mvn"
where mvn >nul 2>nul
if %errorlevel% neq 0 (
    set "MVN_CMD=.\apache-maven-3.9.6\bin\mvn.cmd"
)
start "Backend - Spring Boot" cmd /k "cd /d 05-Development\backend && set "DB_URL=%DB_URL%" && set "DB_USERNAME=%DB_USERNAME%" && set "DB_PASSWORD=%DB_PASSWORD%" && %MVN_CMD% spring-boot:run -Dmaven.test.skip=true"

:: 4. Khởi chạy Frontend trong cửa sổ CMD mới
echo [*] Dang khoi dong Frontend (Vite)...
start "Frontend - Vite" cmd /k "cd /d 05-Development\frontend && npm run dev"

echo.
echo [HOAN THANH] He thong da duoc dong bo va khoi chay!
echo - Backend dang chay tai: http://localhost:8080/api
echo - Frontend dang chay tai: http://localhost:5173/
echo.
echo Trinh duyet se tu dong mo trang web sau 5 giay...

:: Đợi 5 giây rồi mở trình duyệt
timeout /t 5 >nul
start http://localhost:5173/

exit
