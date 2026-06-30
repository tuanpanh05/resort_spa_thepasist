if (Test-Path ".env") {
    Copy-Item ".env" -Destination "05-Development\frontend\.env" -Force
}
cd 05-Development\frontend
npm run dev
