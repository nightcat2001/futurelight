param(
    [string]$FlowFile = (Join-Path $PSScriptRoot 'playwright-e2e-flow.js'),
    [string]$TestEmail = 'playwright-e2e@futurelight.test'
)

$ErrorActionPreference = 'Stop'

$root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$databaseUrl = 'postgres://futurelight:futurelight@localhost:37432/futurelight'
$backendPort = 37200
$frontendPort = 37173
$startedProcesses = @()
$pushedLocation = $false
$runFailed = $false
$startedBackend = $false
$startedFrontend = $false

function Test-PortListening {
    param([int]$Port)
    return [bool](Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue)
}

function Test-UrlAvailable {
    param([string]$Url)
    try {
        $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 3
        return $response.StatusCode -ge 200 -and $response.StatusCode -lt 500
    } catch {
        return $false
    }
}

function Stop-ListeningPortOwner {
    param([int]$Port)

    $ownerIds = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue |
        Select-Object -ExpandProperty OwningProcess -Unique
    foreach ($ownerId in $ownerIds) {
        if ($ownerId -gt 0) {
            Stop-Process -Id $ownerId -Force -ErrorAction SilentlyContinue
        }
    }
}

function Wait-ForUrl {
    param(
        [string]$Url,
        [int]$TimeoutSeconds = 45
    )

    $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
    do {
        try {
            $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 3
            if ($response.StatusCode -ge 200 -and $response.StatusCode -lt 500) {
                return
            }
        } catch {
            Start-Sleep -Milliseconds 500
        }
    } while ((Get-Date) -lt $deadline)

    throw "Timed out waiting for $Url"
}

function Wait-ForPostgres {
    $deadline = (Get-Date).AddSeconds(60)
    do {
        $status = docker inspect --format '{{.State.Health.Status}}' futurelight-postgres 2>$null
        if ($LASTEXITCODE -eq 0 -and $status -eq 'healthy') {
            return
        }
        Start-Sleep -Seconds 1
    } while ((Get-Date) -lt $deadline)

    throw 'Timed out waiting for futurelight-postgres to become healthy.'
}

function Invoke-TestDataCleanup {
    $sql = @"
DELETE FROM audit_logs
WHERE actor_parent_account_id IN (
    SELECT id FROM parent_accounts WHERE email = '$testEmail'
);
DELETE FROM parent_accounts WHERE email = '$testEmail';
"@
    $sql | docker exec -i futurelight-postgres psql -U futurelight -d futurelight -v ON_ERROR_STOP=1 | Out-Null
}

try {
    powershell.exe -NoProfile -ExecutionPolicy Bypass -File C:\Users\USER\Desktop\work\scripts\check-port-policy.ps1

    Push-Location $root
    $pushedLocation = $true
    docker compose up -d postgres
    Wait-ForPostgres
    Invoke-TestDataCleanup

    if (-not (Test-PortListening -Port $backendPort)) {
        $backendLog = Join-Path $root 'output\playwright\backend-e2e.log'
        New-Item -ItemType Directory -Force -Path (Split-Path $backendLog) | Out-Null
        $backendCommand = "`$env:DATABASE_URL='$databaseUrl'; `$env:PORT='$backendPort'; Set-Location '$root\backend'; cargo run *> '$backendLog'"
        $startedProcesses += Start-Process -FilePath 'powershell.exe' -ArgumentList @('-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', $backendCommand) -WindowStyle Hidden -PassThru
        $startedBackend = $true
    }

    $frontendUrl = "http://127.0.0.1:$frontendPort"
    if (-not (Test-UrlAvailable -Url $frontendUrl)) {
        if (Test-PortListening -Port $frontendPort) {
            throw "Frontend port $frontendPort is listening, but $frontendUrl is not reachable. Stop the stale frontend process or ensure Vite binds to 127.0.0.1."
        }

        $frontendLog = Join-Path $root 'output\playwright\frontend-e2e.log'
        $frontendErrorLog = Join-Path $root 'output\playwright\frontend-e2e.err.log'
        New-Item -ItemType Directory -Force -Path (Split-Path $frontendLog) | Out-Null
        Remove-Item -LiteralPath $frontendLog, $frontendErrorLog -Force -ErrorAction SilentlyContinue
        $startedProcesses += Start-Process `
            -FilePath 'npm.cmd' `
            -ArgumentList @('run', 'dev') `
            -WorkingDirectory (Join-Path $root 'frontend') `
            -WindowStyle Hidden `
            -PassThru `
            -RedirectStandardOutput $frontendLog `
            -RedirectStandardError $frontendErrorLog
        $startedFrontend = $true
    }

    Wait-ForUrl -Url "http://127.0.0.1:$backendPort/health"
    Wait-ForUrl -Url $frontendUrl

    if (-not (Test-Path -LiteralPath $FlowFile)) {
        throw "Playwright flow file not found: $FlowFile"
    }

    $playwrightRunner = Join-Path $PSScriptRoot 'playwright-flow-runner.mjs'
    if (-not (Test-Path -LiteralPath $playwrightRunner)) {
        throw "Playwright flow runner not found: $playwrightRunner"
    }

    $playwrightLog = Join-Path $root 'output\playwright\playwright-e2e.log'
    $playwrightErrorLog = Join-Path $root 'output\playwright\playwright-e2e.err.log'
    Remove-Item -LiteralPath $playwrightLog, $playwrightErrorLog -Force -ErrorAction SilentlyContinue
    $playwrightProcess = Start-Process `
        -FilePath 'node' `
        -ArgumentList @($playwrightRunner, '--filename', $FlowFile) `
        -WorkingDirectory $root `
        -WindowStyle Hidden `
        -PassThru `
        -Wait `
        -RedirectStandardOutput $playwrightLog `
        -RedirectStandardError $playwrightErrorLog
    $playwrightOutput = @()
    if (Test-Path -LiteralPath $playwrightLog) {
        $playwrightOutput += Get-Content -LiteralPath $playwrightLog
    }
    if (Test-Path -LiteralPath $playwrightErrorLog) {
        $playwrightOutput += Get-Content -LiteralPath $playwrightErrorLog
    }
    $playwrightOutput | Write-Output
    if ($playwrightProcess.ExitCode -ne 0 -or ($playwrightOutput -match '^### Error')) {
        throw "Playwright E2E failed. See output above."
    }
}
catch {
    $runFailed = $true
    Write-Output $_
}
finally {
    try {
        Invoke-TestDataCleanup
    } catch {
        Write-Warning "Playwright E2E cleanup failed: $_"
    }

    foreach ($process in $startedProcesses) {
        if ($process -and -not $process.HasExited) {
            Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
        }
    }
    if ($startedFrontend) {
        Stop-ListeningPortOwner -Port $frontendPort
    }
    if ($startedBackend) {
        Stop-ListeningPortOwner -Port $backendPort
    }

    if ($pushedLocation) {
        Pop-Location
    }
}

if ($runFailed) {
    exit 1
}
