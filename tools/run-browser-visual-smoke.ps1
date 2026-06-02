$ErrorActionPreference = 'Stop'

$root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$outputDir = Join-Path $root 'output\playwright\visual-smoke'
New-Item -ItemType Directory -Force -Path $outputDir | Out-Null

powershell.exe -NoProfile -ExecutionPolicy Bypass -File (Join-Path $PSScriptRoot 'run-playwright-e2e.ps1') `
    -FlowFile (Join-Path $PSScriptRoot 'playwright-visual-smoke.js') `
    -TestEmail 'playwright-visual@futurelight.test'
