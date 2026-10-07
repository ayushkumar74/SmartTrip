param(
    [int]$Port
)

if (-not $Port) {
    Write-Host "Port is required."
    exit 1
}

$listening = netstat -ano | Where-Object { $_ -match ":$Port\s+.*LISTENING\s+(\d+)" }
if ($listening) {
    $pids = $listening | ForEach-Object {
        if ($_ -match "LISTENING\s+(\d+)") {
            $matches[1]
        }
    } | Select-Object -Unique

    foreach ($p in $pids) {
        Write-Host "Found process $p listening on port $Port. Terminating..."
        Stop-Process -Id $p -Force -ErrorAction SilentlyContinue
        Write-Host "Process $p terminated."
    }
} else {
    Write-Host "No process listening on port $Port."
}
