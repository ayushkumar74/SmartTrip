Write-Host "--- SmartTrip Backend Startup ---"
Write-Host "Cleaning up port 5000..."
& "..\scripts\kill-port.ps1" 5000

Write-Host "Starting Nodemon..."
npx nodemon src/server.js
