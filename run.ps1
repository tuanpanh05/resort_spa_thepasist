Write-Host "=====================================================================" -ForegroundColor Cyan
Write-Host "               NGU SON RESORT - POWERSHELL RUNNER" -ForegroundColor Cyan
Write-Host "=====================================================================" -ForegroundColor Cyan
Write-Host ""

$root = Get-Location

# 1. Cấu hình JAVA_HOME và PATH để sử dụng JDK 21 (Tương thích 100% với Lombok)
$embeddedJava = "C:\Users\Administrator\.vscode\extensions\redhat.java-1.54.0-win32-x64\jre\21.0.10-win32-x86_64"
$systemJdk21Path = "C:\Program Files\Java\jdk-21.0.10"
if (Test-Path "C:\Program Files\Java") {
    $foundJdk = Get-ChildItem "C:\Program Files\Java" -Filter "jdk-21*" | Select-Object -First 1
    if ($foundJdk) {
        $systemJdk21Path = $foundJdk.FullName
    }
}

if (Test-Path $systemJdk21Path) {
    $env:JAVA_HOME = $systemJdk21Path
    $env:PATH = "$systemJdk21Path\bin;" + $env:PATH
    Write-Host "[*] Da thiet lap JAVA_HOME ve JDK 21 tai $systemJdk21Path de tranh crash Lombok." -ForegroundColor Green
} elseif (Test-Path $embeddedJava) {
    $env:JAVA_HOME = $embeddedJava
    $env:PATH = "$embeddedJava\bin;" + $env:PATH
    Write-Host "[*] Da thiet lap JAVA_HOME ve JDK 21 (VS Code Embedded) de tranh crash Lombok." -ForegroundColor Green
} else {
    Write-Host "[!] Khong tim thay JDK 21. Se dung Java mac dinh." -ForegroundColor Yellow
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
            # Thiết lập trực tiếp vào env: để tiến trình con (Start-Process) kế thừa chính xác
            New-Item -Path "env:\$key" -Value $value -Force | Out-Null
        }
    }
} else {
    Write-Host "[!] Khong tim thay file .env o thu muc goc!" -ForegroundColor Red
}

# 3. Sử dụng Database hiện tại (Không reset)
Write-Host "[*] Su dung database hien tai (Khong reset du lieu)." -ForegroundColor Green



# 4. Khởi chạy Backend trong cửa sổ PowerShell mới (Ghi log song song ra logs.txt)
Write-Host "[*] Dang khoi dong Backend (Spring Boot)..." -ForegroundColor Yellow
$mavenCmd = "mvn"
if (-not (Get-Command "mvn" -ErrorAction SilentlyContinue)) {
    $mavenCmd = ".\apache-maven-3.9.6\bin\mvn.cmd"
}
Start-Process powershell -ArgumentList "-NoExit -Command `"cd '$root\05-Development\backend'; `$Host.UI.RawUI.WindowTitle = 'Backend - Spring Boot'; `$env:DB_URL = '$env:DB_URL'; `$env:DB_USERNAME = '$env:DB_USERNAME'; `$env:DB_PASSWORD = '$env:DB_PASSWORD'; $mavenCmd spring-boot:run '-Dmaven.test.skip=true' 2>&1 | Tee-Object -FilePath logs.txt`""

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
