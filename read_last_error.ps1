Get-Content -Path "$PSScriptRoot\05-Development\backend\logs.txt" -Encoding Unicode | Out-File -FilePath "$PSScriptRoot\05-Development\backend\logs_utf8.txt" -Encoding utf8
Write-Host "[OK] Da xuat log ra logs_utf8.txt!" -ForegroundColor Green
