param(
  [string] $DatabaseUrl = $env:DATABASE_URL
)

$ErrorActionPreference = 'Stop'

if ([string]::IsNullOrWhiteSpace($DatabaseUrl)) {
  $DatabaseUrl = 'postgres://futurelight:futurelight@localhost:37432/futurelight'
}

$root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$backend = Join-Path $root 'backend'
$frontend = Join-Path $root 'frontend'

function Invoke-DeliveryStep {
  param(
    [string] $Name,
    [scriptblock] $Command
  )

  Write-Host ""
  Write-Host "==> $Name"
  $global:LASTEXITCODE = 0
  & $Command
  if ($LASTEXITCODE -ne 0) {
    throw "$Name failed with exit code $LASTEXITCODE"
  }
}

function Invoke-CheckedPowerShellScript {
  param(
    [string] $ScriptPath
  )

  $logDir = Join-Path $root 'output\playwright'
  New-Item -ItemType Directory -Force -Path $logDir | Out-Null
  $logName = [IO.Path]::GetFileNameWithoutExtension($ScriptPath)
  $stdoutLog = Join-Path $logDir "$logName.stdout.log"
  $stderrLog = Join-Path $logDir "$logName.stderr.log"
  Remove-Item -LiteralPath $stdoutLog, $stderrLog -Force -ErrorAction SilentlyContinue

  $process = Start-Process `
    -FilePath 'powershell.exe' `
    -ArgumentList @('-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', $ScriptPath) `
    -Wait `
    -PassThru `
    -WindowStyle Hidden `
    -RedirectStandardOutput $stdoutLog `
    -RedirectStandardError $stderrLog

  $combinedOutput = @()
  if (Test-Path -LiteralPath $stdoutLog) {
    $stdout = Get-Content -LiteralPath $stdoutLog
    $stdout | Write-Output
    $combinedOutput += $stdout
  }
  if (Test-Path -LiteralPath $stderrLog) {
    $stderr = Get-Content -LiteralPath $stderrLog
    $stderr | Write-Output
    $combinedOutput += $stderr
  }

  if (
    $process.ExitCode -ne 0 `
    -or ($combinedOutput -match '^### Error') `
    -or ($combinedOutput -match 'Playwright E2E failed')
  ) {
    throw "$ScriptPath failed with exit code $($process.ExitCode)"
  }
}

Invoke-DeliveryStep 'Workspace port policy' {
  powershell.exe -NoProfile -ExecutionPolicy Bypass -File 'C:\Users\USER\Desktop\work\scripts\check-port-policy.ps1'
}

Invoke-DeliveryStep 'Git whitespace check' {
  Push-Location $root
  try {
    git diff --check
  } finally {
    Pop-Location
  }
}

Invoke-DeliveryStep 'Backend migration check' {
  Push-Location $backend
  try {
    $env:DATABASE_URL = $DatabaseUrl
    cargo run -- migrate
  } finally {
    Pop-Location
  }
}

Invoke-DeliveryStep 'Rust fmt' {
  Push-Location $backend
  try {
    cargo fmt --check
  } finally {
    Pop-Location
  }
}

Invoke-DeliveryStep 'Rust clippy' {
  Push-Location $backend
  try {
    cargo clippy --all-targets -- -D warnings
  } finally {
    Pop-Location
  }
}

Invoke-DeliveryStep 'Rust tests' {
  Push-Location $backend
  try {
    $env:DATABASE_URL = $DatabaseUrl
    cargo test
  } finally {
    Pop-Location
  }
}

Invoke-DeliveryStep 'Backend content publish check' {
  Push-Location $backend
  try {
    $env:DATABASE_URL = $DatabaseUrl
    cargo run -- check-content
  } finally {
    Pop-Location
  }
}

Invoke-DeliveryStep 'Frontend build' {
  Push-Location $frontend
  try {
    npm.cmd run build
  } finally {
    Pop-Location
  }
}

Invoke-DeliveryStep 'Frontend lint' {
  Push-Location $frontend
  try {
    npm.cmd run lint
  } finally {
    Pop-Location
  }
}

Invoke-DeliveryStep 'Playwright E2E' {
  Invoke-CheckedPowerShellScript -ScriptPath (Join-Path $root 'tools\run-playwright-e2e.ps1')
}

Invoke-DeliveryStep 'Browser visual smoke' {
  Invoke-CheckedPowerShellScript -ScriptPath (Join-Path $root 'tools\run-browser-visual-smoke.ps1')
}

Invoke-DeliveryStep 'Content and asset checker' {
  node (Join-Path $root 'tools\check-content-assets.mjs')
}

Invoke-DeliveryStep 'Secret scan' {
  powershell.exe -NoProfile -ExecutionPolicy Bypass -File (Join-Path $root 'tools\check-secrets.ps1')
}

Write-Host ""
Write-Host 'Delivery verification passed.'
