param(
    [string]$Model,
    [string]$InputJson,
    [string]$OutputDir = "assets/video/generated",
    [switch]$Check
)

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$dockerfile = Join-Path $repoRoot "infra/runcomfy/Dockerfile"
$imageName = "futurelight-runcomfy"

if (-not (Test-Path -LiteralPath $dockerfile)) {
    throw "RunComfy Dockerfile not found: $dockerfile"
}

docker build -t $imageName -f $dockerfile (Split-Path -Parent $dockerfile)

if ($Check) {
    docker run --rm $imageName --help
    exit 0
}

if (-not $Model) {
    throw "Missing -Model. Example: -Model bytedance/seedance-v2/pro"
}

if (-not $InputJson) {
    throw "Missing -InputJson. Example: -InputJson tools/runcomfy-seedance-example.json"
}

if (-not $env:RUNCOMFY_TOKEN) {
    throw "Set RUNCOMFY_TOKEN before running RunComfy jobs."
}

$inputPath = (Resolve-Path -LiteralPath (Join-Path $repoRoot $InputJson)).ProviderPath
$outputPath = Join-Path $repoRoot $OutputDir
New-Item -ItemType Directory -Force -Path $outputPath | Out-Null
$resolvedOutput = (Resolve-Path -LiteralPath $outputPath).ProviderPath

docker run --rm `
    -e "RUNCOMFY_TOKEN=$env:RUNCOMFY_TOKEN" `
    -v "${inputPath}:/work/input.json:ro" `
    -v "${resolvedOutput}:/output" `
    $imageName `
    run $Model --input-file /work/input.json --output-dir /output
