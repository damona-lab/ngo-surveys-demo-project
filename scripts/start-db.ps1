# Starts the local MongoDB used by the app (single-node replica set "rs0").
# Safe to re-run: does nothing when 127.0.0.1:27017 is already accepting connections.
# Usage: npm run db:start
$ErrorActionPreference = 'Stop'

$mongoRoot = Join-Path $env:LOCALAPPDATA 'MongoDB'
$mongod    = Join-Path $mongoRoot 'bin\mongod.exe'
$dbPath    = Join-Path $mongoRoot 'data'
$logPath   = Join-Path $mongoRoot 'log\mongod.log'
$keyFile   = Join-Path $mongoRoot 'keyfile'

if (-not (Test-Path $mongod)) {
  throw "mongod.exe was not found at $mongod. Install MongoDB Community Server first."
}

if (Test-NetConnection -ComputerName 127.0.0.1 -Port 27017 -InformationLevel Quiet -WarningAction SilentlyContinue) {
  Write-Host 'MongoDB is already running on 127.0.0.1:27017.'
  exit 0
}

New-Item -ItemType Directory -Force -Path $dbPath, (Split-Path $logPath) | Out-Null

$arguments = @(
  '--bind_ip', '127.0.0.1',
  '--port', '27017',
  '--replSet', 'rs0',
  '--dbpath', $dbPath,
  '--wiredTigerCacheSizeGB', '0.25',
  '--logpath', $logPath,
  '--logappend'
)
# The keyfile enables internal auth + authorization; add it once db:setup has run.
if (Test-Path $keyFile) { $arguments += @('--auth', '--keyFile', $keyFile) }

Start-Process -FilePath $mongod -ArgumentList $arguments -WindowStyle Hidden | Out-Null
Write-Host 'Starting MongoDB (replica set rs0) on 127.0.0.1:27017...'

for ($i = 0; $i -lt 30; $i++) {
  Start-Sleep -Seconds 1
  if (Test-NetConnection -ComputerName 127.0.0.1 -Port 27017 -InformationLevel Quiet -WarningAction SilentlyContinue) {
    Write-Host 'MongoDB is ready.'
    exit 0
  }
}

throw "MongoDB did not start within 30 seconds. Check the log at $logPath"
