Write-Host "=====================================================================" -ForegroundColor Cyan
Write-Host "               NGU SON RESORT - POWERSHELL RUNNER" -ForegroundColor Cyan
Write-Host "=====================================================================" -ForegroundColor Cyan
Write-Host ""

$root = Get-Location

# 1. Cấu hình JAVA_HOME và PATH để sử dụng JDK 21 từ VS Code Extensions (Tương thích 100% với Lombok)
$embeddedJava = "C:\Users\Administrator\.vscode\extensions\redhat.java-1.54.0-win32-x64\jre\21.0.10-win32-x86_64"
if (Test-Path $embeddedJava) {
    $env:JAVA_HOME = $embeddedJava
    $env:PATH = "$embeddedJava\bin;" + $env:PATH
    Write-Host "[*] Da thiet lap JAVA_HOME ve JDK 21 (VS Code Embedded) de tranh crash Lombok." -ForegroundColor Green
} else {
    Write-Host "[!] Khong tim thay JDK 21 embedded. Se dung Java mac dinh." -ForegroundColor Yellow
}

# 2. Đồng bộ file .env sang Frontend và Backend
Write-Host "[*] Dang dong bo file .env sang Frontend va Backend..." -ForegroundColor Yellow
if (Test-Path ".env") {
    Copy-Item ".env" -Destination "$root\05-Development\frontend\.env" -Force
    Copy-Item ".env" -Destination "$root\05-Development\backend\.env" -Force
    Write-Host "[OK] Da dong bo file .env!" -ForegroundColor Green

    # Nạp các biến môi trường vào tiến trình hiện tại
    Get-Content ".env" | Where-Object { $_ -and -not $_.StartsWith("#") } | ForEach-Object {
        $parts = $_ -split '=', 2
        if ($parts.Count -eq 2) {
            $key = $parts[0].Trim()
            $value = $parts[1].Trim()
            [System.Environment]::SetEnvironmentVariable($key, $value, "Process")
        }
    }
} else {
    Write-Host "[!] Khong tim thay file .env o thu muc goc!" -ForegroundColor Red
}

# 3. Xóa database cũ và chạy file ResortSpaDB_Master.sql mới
Write-Host "[*] Dang kiem tra cong cu sqlcmd..." -ForegroundColor Yellow
$hasSqlcmd = Get-Command sqlcmd -ErrorAction SilentlyContinue
if ($hasSqlcmd) {
    Write-Host "[*] Dang ngat ket noi va xoa Database cu (ResortSpaDB)..." -ForegroundColor Yellow
    $dropQuery = "IF DB_ID('ResortSpaDB') IS NOT NULL ALTER DATABASE ResortSpaDB SET SINGLE_USER WITH ROLLBACK IMMEDIATE; IF DB_ID('ResortSpaDB') IS NOT NULL DROP DATABASE ResortSpaDB;"
    & sqlcmd -S localhost -U sa -P 123 -Q $dropQuery 2>$null
    
    Write-Host "[*] Dang thuc thi file database master moi (ResortSpaDB_Master.sql)..." -ForegroundColor Yellow
    $masterSqlPath = "$root\03-Design\database\ResortSpaDB_Master.sql"
    if (Test-Path $masterSqlPath) {
        & sqlcmd -S localhost -U sa -P 123 -i $masterSqlPath
        Write-Host "[OK] Da nap database master thanh cong!" -ForegroundColor Green
    } else {
        Write-Host "[!] Khong tim thay file ResortSpaDB_Master.sql tai: $masterSqlPath" -ForegroundColor Red
    }
} else {
    Write-Host "[!] Khong tim thay sqlcmd. Vui long dam bao SQL Server dang chay va ban da tao database." -ForegroundColor Red
}

# 4. Khởi chạy Backend trong cửa sổ CMD mới (Kế thừa biến môi trường JAVA_HOME/PATH/DB)
Write-Host "[*] Dang khoi dong Backend (Spring Boot)..." -ForegroundColor Yellow
Start-Process cmd -ArgumentList "/k cd /d `"$root\05-Development\backend`" && title Backend - Spring Boot && .\apache-maven-3.9.6\bin\mvn.cmd spring-boot:run -Dmaven.test.skip=true"

# 5. Khởi chạy Frontend trong cửa sổ CMD mới
Write-Host "[*] Dang khoi dong Frontend (Vite)..." -ForegroundColor Yellow
Start-Process cmd -ArgumentList "/k cd /d `"$root\05-Development\frontend`" && title Frontend - Vite && npm run dev"

Write-Host ""
Write-Host "[HOAN THANH] He thong da duoc dong bo va khoi chay!" -ForegroundColor Green
Write-Host "- Backend dang chay tai: http://localhost:8080/api" -ForegroundColor Green
Write-Host "- Frontend dang chay tai: http://localhost:5173/" -ForegroundColor Green
Write-Host ""
Write-Host "Trinh duyet se tu dong mo trang web sau 5 giay..." -ForegroundColor Yellow
Start-Sleep -Seconds 5
Start-Process "http://localhost:5173/"
