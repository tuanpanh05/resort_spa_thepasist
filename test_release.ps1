try {
    $response = Invoke-RestMethod -Uri 'http://localhost:8080/api/chef/tables/T01/release' -Method Post
    $response | ConvertTo-Json
} catch {
    Write-Host "ERROR:"
    Write-Host $_.Exception.Message
    $stream = $_.Exception.Response.GetResponseStream()
    $reader = New-Object System.IO.StreamReader($stream)
    $errorBody = $reader.ReadToEnd()
    Write-Host "BODY: $errorBody"
}
