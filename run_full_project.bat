@echo off
title Ngu Son Resort - He Thong Khoi Chay Tu Dong
color 0B

echo =====================================================================
echo                NGU SON RESORT - ALL-IN-ONE RUNNER
echo =====================================================================
echo.

:: =====================================================================
:: CAU HINH MAC DINH CHO HE THONG:
:: =====================================================================
set "AUTH_MODE=WINDOWS"
set "DB_HOST=localhost"
set "DB_PORT=1433"
set "DB_NAME=ResortSpaDB"
set "DB_USER=sa"
set "DB_PASS=123"

set "VITE_FIREBASE_API_KEY=AIzaSyAY5n15AiNfV96C3gSuTJLETPI56WAOhJo"
set "VITE_FIREBASE_AUTH_DOMAIN=ngusonresort.firebaseapp.com"
set "VITE_FIREBASE_PROJECT_ID=ngusonresort"
set "VITE_FIREBASE_STORAGE_BUCKET=ngusonresort.firebasestorage.app"
set "VITE_FIREBASE_MESSAGING_SENDER_ID=82237656884"
set "VITE_FIREBASE_APP_ID=1:82237656884:web:fd37de867fc02ae0e4df61"

set "MAIL_USERNAME=tuananh1122hy@gmail.com"
set "MAIL_PASSWORD=elfptjtgfmuqluoi"
set "MAIL_FROM=tuananh1122hy@gmail.com"

set "VNP_TMN_CODE=12YK9LVK"
set "VNP_HASH_SECRET=3ZAHQSNZONCKAGFBCH7B1UX1LAVIWXH9"

set "JWT_SECRET=9a4f2c8d3b7a1e5f8c9d0a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v"
set "AES_SECRET=mySecretKeyForAesEncryptionModul"
:: =====================================================================

:: Nap cau hinh cu tu file db_settings.bat neu ton tai
if exist "%~dp0db_settings.bat" (
    echo [*] Dang nap cau hinh ket noi tu db_settings.bat...
    call "%~dp0db_settings.bat"
)

:: 0. Tu dong xoa cac file bat khac de tranh nham lan o thu muc goc
if exist "%~dp0run-all-tests.bat" del /f /q "%~dp0run-all-tests.bat"
if exist "%~dp0run-project.bat" del /f /q "%~dp0run-project.bat"
if exist "%~dp0run-vnpay-clean-test.bat" del /f /q "%~dp0run-vnpay-clean-test.bat"
if exist "%~dp0run_all.bat" del /f /q "%~dp0run_all.bat"
if exist "%~dp0run_git_merge.bat" del /f /q "%~dp0run_git_merge.bat"
if exist "%~dp0start_backend.bat" del /f /q "%~dp0start_backend.bat"

:: 1. Kiem tra va setup ket noi SQL Server
echo [*] Dang kiem tra cong cu sqlcmd...
where sqlcmd >nul 2>nul
if %errorlevel% neq 0 (
    color 0E
    echo [CANH BAO] Khong tim thay cong cu sqlcmd tren he thong.
    echo -- Ban can dam bao database '%DB_NAME%' da ton tai va duoc nap du lieu trong SSMS.
    echo -- Nhan phim bat ky de bo qua va tiep tuc chay ung dung...
    pause
    goto run_app
)

:check_db_conn
echo [*] Dang kiem tra ket noi den SQL Server (%DB_HOST%)...
set "CONN_OK=0"

if /i "%AUTH_MODE%"=="WINDOWS" goto test_conn_windows
goto test_conn_sql

:test_conn_windows
sqlcmd -S "%DB_HOST%" -E -Q "SELECT 1" -l 3 >nul 2>&1
if %errorlevel% equ 0 (
    set "CONN_OK=1"
    goto test_conn_done
)
sqlcmd -S "%DB_HOST%,%DB_PORT%" -E -Q "SELECT 1" -l 3 >nul 2>&1
if %errorlevel% equ 0 (
    set "CONN_OK=1"
)
goto test_conn_done

:test_conn_sql
sqlcmd -S "%DB_HOST%" -U "%DB_USER%" -P "%DB_PASS%" -Q "SELECT 1" -l 3 >nul 2>&1
if %errorlevel% equ 0 (
    set "CONN_OK=1"
    goto test_conn_done
)
sqlcmd -S "%DB_HOST%,%DB_PORT%" -U "%DB_USER%" -P "%DB_PASS%" -Q "SELECT 1" -l 3 >nul 2>&1
if %errorlevel% equ 0 (
    set "CONN_OK=1"
)
goto test_conn_done

:test_conn_done
if "%CONN_OK%"=="1" (
    echo [OK] Ket noi den SQL Server thanh cong!
    goto sync_db
)

:: Neu ket noi loi, bat dau trinh wizard cau hinh
cls
color 0E
echo =====================================================================
echo    [CANH BAO] KHONG THE KET NOI TOI SQL SERVER!
echo =====================================================================
echo.
echo Thong tin ket noi hien tai dang bi loi:
echo - Server Host : %DB_HOST%
echo - Port        : %DB_PORT%
echo - Kieu xac thuc: %AUTH_MODE%
if /i "%AUTH_MODE%"=="SQL" (
    echo - Username    : %DB_USER%
    echo - Password    : %DB_PASS%
)
echo.
echo Vui long chon huong xu ly:
echo [1] Tu tay nhap thong tin ket noi moi (Khuyen nghi)
echo [2] Su dung Windows Authentication voi Localhost (Mac dinh)
echo [3] Su dung SQL Server Authentication (sa / 123) voi Localhost
echo [4] Bo qua kiem tra va tiep tuc khoi chay (Co the gap loi khi run app)
echo.
set "choice=1"
set /p "choice=Nhap lua chon cua ban (1-4, mac dinh 1): "

if "%choice%"=="2" goto set_quick_win
if "%choice%"=="3" goto set_quick_sql
if "%choice%"=="4" goto skip_check_db
goto config_wizard

:set_quick_win
set "AUTH_MODE=WINDOWS"
set "DB_HOST=localhost"
set "DB_PORT=1433"
goto save_and_retry

:set_quick_sql
set "AUTH_MODE=SQL"
set "DB_HOST=localhost"
set "DB_PORT=1433"
set "DB_USER=sa"
set "DB_PASS=123"
goto save_and_retry

:skip_check_db
color 0B
goto run_app

:config_wizard
cls
echo =====================================================================
echo    TRINH CAU HINH KET NOI DATABASE SQL SERVER
echo =====================================================================
echo.
set "temp_host="
set /p "temp_host=1. Nhap ten SQL Server (Vi du: localhost, .\SQLEXPRESS, (local) - Mac dinh: localhost): "
if "%temp_host%"=="" set "temp_host=localhost"
set "DB_HOST=%temp_host%"

set "temp_port="
set /p "temp_port=2. Nhap Port SQL Server (Mac dinh: 1433): "
if "%temp_port%"=="" set "temp_port=1433"
set "DB_PORT=%temp_port%"

echo.
echo Chon kieu xac thuc SQL Server:
echo [1] Windows Authentication (Khong mat khau)
echo [2] SQL Server Authentication (Username / Password)
set "auth_choice=1"
set /p "auth_choice=Nhap lua chon (1 hoac 2, mac dinh 1): "

if "%auth_choice%"=="2" goto config_sql_auth
set "AUTH_MODE=WINDOWS"
goto save_and_retry

:config_sql_auth
set "AUTH_MODE=SQL"
set "temp_user="
set /p "temp_user=3. Nhap Username (Mac dinh: sa): "
if "%temp_user%"=="" set "temp_user=sa"
set "DB_USER=%temp_user%"

set "temp_pass="
set /p "temp_pass=4. Nhap Password (Mac dinh: 123): "
if "%temp_pass%"=="" set "temp_pass=123"
set "DB_PASS=%temp_pass%"
goto save_and_retry

:save_and_retry
:: Ghi lai cau hinh vao file db_settings.bat de luu tru (Dung dau redirection o dau de tranh loi ky tu so o cuoi)
> "%~dp0db_settings.bat" echo set "DB_HOST=%DB_HOST%"
>> "%~dp0db_settings.bat" echo set "DB_PORT=%DB_PORT%"
>> "%~dp0db_settings.bat" echo set "AUTH_MODE=%AUTH_MODE%"
>> "%~dp0db_settings.bat" echo set "DB_USER=%DB_USER%"
>> "%~dp0db_settings.bat" echo set "DB_PASS=%DB_PASS%"
>> "%~dp0db_settings.bat" echo set "DB_NAME=%DB_NAME%"
echo [*] Da luu thong tin cau hinh vao file db_settings.bat.
color 0B
goto check_db_conn


:sync_db
echo [*] Dang kiem tra Database '%DB_NAME%'...

:: Kiem tra neu Database chua ton tai thi tao moi
if /i "%AUTH_MODE%"=="WINDOWS" goto create_db_windows
goto create_db_sql

:create_db_windows
sqlcmd -S "%DB_HOST%" -E -Q "IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = N'%DB_NAME%') CREATE DATABASE [%DB_NAME%]" >nul 2>&1
if %errorlevel% equ 0 goto create_db_done
sqlcmd -S "%DB_HOST%,%DB_PORT%" -E -Q "IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = N'%DB_NAME%') CREATE DATABASE [%DB_NAME%]" >nul 2>&1
goto create_db_done

:create_db_sql
sqlcmd -S "%DB_HOST%" -U "%DB_USER%" -P "%DB_PASS%" -Q "IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = N'%DB_NAME%') CREATE DATABASE [%DB_NAME%]" >nul 2>&1
if %errorlevel% equ 0 goto create_db_done
sqlcmd -S "%DB_HOST%,%DB_PORT%" -U "%DB_USER%" -P "%DB_PASS%" -Q "IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = N'%DB_NAME%') CREATE DATABASE [%DB_NAME%]" >nul 2>&1
goto create_db_done

:create_db_done
:: Kiem tra neu DB rong (chua co bang User) thi thuc thi file resort_spa_db.sql de dong bo hoa database
set "DB_EMPTY=1"
if /i "%AUTH_MODE%"=="WINDOWS" goto check_empty_windows
goto check_empty_sql

:check_empty_windows
sqlcmd -S "%DB_HOST%" -E -d "%DB_NAME%" -Q "IF OBJECT_ID('dbo.[User]', 'U') IS NOT NULL SELECT 1 ELSE THROW 50000, 'Empty', 1" >nul 2>&1
if %errorlevel% equ 0 set "DB_EMPTY=0"
if "%DB_EMPTY%"=="0" goto check_empty_done
sqlcmd -S "%DB_HOST%,%DB_PORT%" -E -d "%DB_NAME%" -Q "IF OBJECT_ID('dbo.[User]', 'U') IS NOT NULL SELECT 1 ELSE THROW 50000, 'Empty', 1" >nul 2>&1
if %errorlevel% equ 0 set "DB_EMPTY=0"
goto check_empty_done

:check_empty_sql
sqlcmd -S "%DB_HOST%" -U "%DB_USER%" -P "%DB_PASS%" -d "%DB_NAME%" -Q "IF OBJECT_ID('dbo.[User]', 'U') IS NOT NULL SELECT 1 ELSE THROW 50000, 'Empty', 1" >nul 2>&1
if %errorlevel% equ 0 set "DB_EMPTY=0"
if "%DB_EMPTY%"=="0" goto check_empty_done
sqlcmd -S "%DB_HOST%,%DB_PORT%" -U "%DB_USER%" -P "%DB_PASS%" -d "%DB_NAME%" -Q "IF OBJECT_ID('dbo.[User]', 'U') IS NOT NULL SELECT 1 ELSE THROW 50000, 'Empty', 1" >nul 2>&1
if %errorlevel% equ 0 set "DB_EMPTY=0"
goto check_empty_done

:check_empty_done
if "%DB_EMPTY%"=="0" (
    echo [OK] Database '%DB_NAME%' da san sang va da chua du lieu.
    goto run_app
)

echo [*] Phat hien Database trong. Dang dong bo hoa bang va nap du lieu tu resort_spa_db.sql...
if /i "%AUTH_MODE%"=="WINDOWS" goto populate_windows
goto populate_sql

:populate_windows
sqlcmd -S "%DB_HOST%" -E -i "%~dp005-Development\backend\src\main\resources\resort_spa_db.sql"
if %errorlevel% equ 0 goto populate_done
sqlcmd -S "%DB_HOST%,%DB_PORT%" -E -i "%~dp005-Development\backend\src\main\resources\resort_spa_db.sql"
goto populate_done

:populate_sql
sqlcmd -S "%DB_HOST%" -U "%DB_USER%" -P "%DB_PASS%" -i "%~dp005-Development\backend\src\main\resources\resort_spa_db.sql"
if %errorlevel% equ 0 goto populate_done
sqlcmd -S "%DB_HOST%,%DB_PORT%" -U "%DB_USER%" -P "%DB_PASS%" -i "%~dp005-Development\backend\src\main\resources\resort_spa_db.sql"
goto populate_done

:populate_done
echo [OK] Dong bo hoa va nap du lieu ban dau thanh cong!


:run_app
:: 2. Dong bo hoa bien moi truong va tao file .env cho ca root, frontend va backend
if /i "%AUTH_MODE%"=="WINDOWS" goto run_app_windows
set "CONN_URL=jdbc:sqlserver://%DB_HOST%:%DB_PORT%;databaseName=%DB_NAME%;encrypt=true;trustServerCertificate=true"
set "CONN_USER=%DB_USER%"
set "CONN_PASS=%DB_PASS%"
goto run_app_env

:run_app_windows
set "CONN_URL=jdbc:sqlserver://%DB_HOST%:%DB_PORT%;databaseName=%DB_NAME%;integratedSecurity=true;encrypt=true;trustServerCertificate=true"
set "CONN_USER="
set "CONN_PASS="

:run_app_env
:: Thiet lap cac bien moi truong cho session CMD hien tai cua process cha
set "DB_URL=%CONN_URL%"
set "DB_USERNAME=%CONN_USER%"
set "DB_PASSWORD=%CONN_PASS%"

echo [*] Dang tao file .env tai thu muc goc...
> "%~dp0.env" echo # Ngu Son Resort - Tu dong sinh tu run_full_project.bat
>> "%~dp0.env" echo VITE_API_BASE_URL=http://localhost:8080/api
>> "%~dp0.env" echo VITE_FIREBASE_API_KEY=%VITE_FIREBASE_API_KEY%
>> "%~dp0.env" echo VITE_FIREBASE_AUTH_DOMAIN=%VITE_FIREBASE_AUTH_DOMAIN%
>> "%~dp0.env" echo VITE_FIREBASE_PROJECT_ID=%VITE_FIREBASE_PROJECT_ID%
>> "%~dp0.env" echo VITE_FIREBASE_STORAGE_BUCKET=%VITE_FIREBASE_STORAGE_BUCKET%
>> "%~dp0.env" echo VITE_FIREBASE_MESSAGING_SENDER_ID=%VITE_FIREBASE_MESSAGING_SENDER_ID%
>> "%~dp0.env" echo VITE_FIREBASE_APP_ID=%VITE_FIREBASE_APP_ID%
>> "%~dp0.env" echo.
>> "%~dp0.env" echo DB_URL=%CONN_URL%
>> "%~dp0.env" echo DB_USERNAME=%CONN_USER%
>> "%~dp0.env" echo DB_PASSWORD=%CONN_PASS%
>> "%~dp0.env" echo JWT_SECRET=%JWT_SECRET%
>> "%~dp0.env" echo AES_SECRET=%AES_SECRET%
>> "%~dp0.env" echo MAIL_USERNAME=%MAIL_USERNAME%
>> "%~dp0.env" echo MAIL_PASSWORD=%MAIL_PASSWORD%
>> "%~dp0.env" echo MAIL_FROM=%MAIL_FROM%
>> "%~dp0.env" echo VNP_TMN_CODE=%VNP_TMN_CODE%
>> "%~dp0.env" echo VNP_HASH_SECRET=%VNP_HASH_SECRET%

echo [*] Dang dong bo file .env sang Frontend va Backend...
copy /y "%~dp0.env" "%~dp005-Development\frontend\.env" >nul
copy /y "%~dp0.env" "%~dp005-Development\backend\.env" >nul
echo [OK] Dong bo hoa file .env thanh cong!

:: 3. Kiem tra Java JDK
:check_java
set "VALID_JAVA=0"
if defined JAVA_HOME if exist "%JAVA_HOME%\bin\java.exe" set "VALID_JAVA=1"
if "%VALID_JAVA%"=="1" goto java_found

if exist "C:\Program Files\Java\jdk-24\bin\java.exe" (
    set "JAVA_HOME=C:\Program Files\Java\jdk-24"
    set "VALID_JAVA=1"
    goto java_found
)
if exist "C:\Users\Administrator\.jdks\corretto-17.0.14\bin\java.exe" (
    set "JAVA_HOME=C:\Users\Administrator\.jdks\corretto-17.0.14"
    set "VALID_JAVA=1"
    goto java_found
)
if exist "C:\Users\Administrator\.vscode\extensions\redhat.java-1.54.0-win32-x64\jre\21.0.10-win32-x86_64\bin\java.exe" (
    set "JAVA_HOME=C:\Users\Administrator\.vscode\extensions\redhat.java-1.54.0-win32-x64\jre\21.0.10-win32-x86_64"
    set "VALID_JAVA=1"
    goto java_found
)
if exist "C:\Program Files\Java\jdk-21\bin\java.exe" (
    set "JAVA_HOME=C:\Program Files\Java\jdk-21"
    set "VALID_JAVA=1"
    goto java_found
)
if exist "C:\Program Files\Java\jdk-17\bin\java.exe" (
    set "JAVA_HOME=C:\Program Files\Java\jdk-17"
    set "VALID_JAVA=1"
    goto java_found
)

where java >nul 2>nul
if %errorlevel% equ 0 (
    set "VALID_JAVA=1"
    goto java_found_no_home
)

color 0C
echo [LOI] Khong tim thay Java JDK! Vui long cai dat JDK 17+ hoac thiet lap bien moi truong JAVA_HOME.
pause
exit /b

:java_found
set "PATH=%JAVA_HOME%\bin;%PATH%"
:java_found_no_home

:: 4. Kiem tra Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    color 0C
    echo [LOI] Node.js chua duoc cai dat! Vui long tai va cai dat Node.js.
    pause
    exit /b
)

:: 5. Tu dong chay npm install neu chua co node_modules o Frontend
if not exist "%~dp005-Development\frontend\node_modules\" (
    echo [*] Dang tu dong tai va cai dat thu vien Frontend (npm install)...
    pushd "%~dp005-Development\frontend"
    call npm install
    popd
)

:: 6. Khoi dong cac server
echo.
echo [*] Dang khoi dong Backend (Spring Boot)...
start "Backend - Spring Boot" cmd /k "cd /d %~dp005-Development\backend && title Backend - Spring Boot && .\apache-maven-3.9.6\bin\mvn.cmd spring-boot:run -Dmaven.test.skip=true"

echo [*] Dang khoi dong Frontend (Vite)...
start "Frontend - Vite" cmd /k "cd /d %~dp005-Development\frontend && title Frontend - Vite && npm run dev"

echo.
echo =====================================================================
echo [HOAN THANH] He thong da duoc khoi chay!
echo - API Backend: http://localhost:8080/api
echo - Web Frontend: http://localhost:5173/
echo =====================================================================
echo.
echo Trinh duyet se tu dong mo trang web sau 5 giay...
timeout /t 5 >nul
start http://localhost:5173/
exit /b
