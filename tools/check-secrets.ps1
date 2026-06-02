$ErrorActionPreference = 'Stop'

if (-not (Get-Command rg -ErrorAction SilentlyContinue)) {
  throw 'ripgrep (rg) is required for the secret scan.'
}

$root = Resolve-Path (Join-Path $PSScriptRoot '..')

$patterns = @(
  'sk-[A-Za-z0-9]{20,}',
  'gh[pousr]_[A-Za-z0-9_]{20,}',
  'AKIA[0-9A-Z]{16}',
  'AIza[0-9A-Za-z_-]{35}',
  'xox[baprs]-[A-Za-z0-9-]{10,}',
  '-----BEGIN (RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----',
  '(?i)stripe[_-]?(secret|restricted)?[_-]?key\s*[:=]\s*["'']?[A-Za-z0-9_./+=-]{24,}',
  '(?i)(api[_-]?key|client[_-]?secret|private[_-]?key)\s*[:=]\s*["'']?[A-Za-z0-9_./+=-]{32,}'
)

$args = @(
  '--line-number',
  '--hidden',
  '--no-heading',
  '--glob', '!.git/**',
  '--glob', '!frontend/node_modules/**',
  '--glob', '!frontend/dist/**',
  '--glob', '!backend/target/**',
  '--glob', '!docs/artifacts/**',
  '--glob', '!*.lock'
)

foreach ($pattern in $patterns) {
  $args += @('-e', $pattern)
}

$args += '.'

Push-Location $root
try {
  $output = & rg @args
  $exitCode = $LASTEXITCODE
} finally {
  Pop-Location
}

if ($exitCode -eq 0) {
  Write-Error "Potential secret(s) found:`n$output"
  exit 1
}

if ($exitCode -gt 1) {
  exit $exitCode
}

Write-Host 'Secret scan passed.'
