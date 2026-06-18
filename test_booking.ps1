$body = @{
    fullName = "Test User"
    email = "testuser@gmail.com"
    phone = "0123456789"
    checkInDate = "2026-06-20T14:00:00"
    checkOutDate = "2026-06-25T12:00:00"
    guestsCount = 2
    villaId = 1
    roomId = 1
    packageId = 1
    serviceIds = @(1, 2)
    allergies = "None"
    explicitConsentSigned = $true
    mealSelections = @{}
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/bookings/create" -Method Post -Body $body -ContentType "application/json"
    Write-Host "Success:"
    $response | ConvertTo-Json -Depth 5
} catch {
    Write-Host "Error Status: $_"
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response Body: $responseBody"
    }
}
