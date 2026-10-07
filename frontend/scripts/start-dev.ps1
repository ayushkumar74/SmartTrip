Write-Host "--- SmartTrip Frontend Startup ---"
Write-Host "Cleaning up port 5174..."
& "..\scripts\kill-port.ps1" 5174

Write-Host "Clearing Vite cache..."
if (Test-Path "node_modules\.vite") {
    Remove-Item -Recurse -Force "node_modules\.vite"
}

Write-Host "Starting Vite server on 5174..."
npx vite --host 0.0.0.0
