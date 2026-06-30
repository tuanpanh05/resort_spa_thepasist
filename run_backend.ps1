# Load environment variables from .env
if (Test-Path ".env") {
    Get-Content ".env" | Where-Object { $_ -and -not $_.StartsWith("#") } | ForEach-Object {
        $parts = $_ -split '=', 2
        if ($parts.Count -eq 2) {
            $key = $parts[0].Trim()
            $value = $parts[1].Trim()
            [System.Environment]::SetEnvironmentVariable($key, $value, "Process")
        }
    }
} else {
    Write-Error "No .env file found!"
    exit 1
}

# Change directory and run Spring Boot
cd 05-Development\backend
mvn spring-boot:run "-Dmaven.test.skip=true"
