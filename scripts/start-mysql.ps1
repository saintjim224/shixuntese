$ErrorActionPreference = "Stop"
. "$PSScriptRoot\set-env.ps1"

$ini = Join-Path $env:MYSQL_HOME "my-qitoffer.ini"
$dataDir = Join-Path $env:MYSQL_HOME "data-qitoffer"

if (-not (Test-Path $ini)) {
  @"
[mysqld]
basedir=$($env:MYSQL_HOME -replace '\\','/')
datadir=$($dataDir -replace '\\','/')
port=3307
bind-address=127.0.0.1
character-set-server=utf8mb4
collation-server=utf8mb4_0900_ai_ci
mysqlx=0

[client]
port=3307
default-character-set=utf8mb4
"@ | Set-Content -Path $ini -Encoding ASCII
}

if (-not (Test-Path $dataDir)) {
  & "$env:MYSQL_HOME\bin\mysqld.exe" --defaults-file="$ini" --initialize-insecure --console
}

if (-not (Get-NetTCPConnection -LocalPort 3307 -ErrorAction SilentlyContinue)) {
  Start-Process -FilePath "$env:MYSQL_HOME\bin\mysqld.exe" -ArgumentList "--defaults-file=$ini" -WindowStyle Hidden
  Start-Sleep -Seconds 2
}

$oldErrorAction = $ErrorActionPreference
$ErrorActionPreference = "Continue"
$pingOutput = & "$env:MYSQL_HOME\bin\mysqladmin.exe" --protocol=tcp --host=127.0.0.1 --port=3307 --user=root --password=Root@2026 ping 2>&1
$pingCode = $LASTEXITCODE
if ($pingCode -ne 0) {
  $pingOutput = & "$env:MYSQL_HOME\bin\mysqladmin.exe" --protocol=tcp --host=127.0.0.1 --port=3307 --user=root ping 2>&1
  $pingCode = $LASTEXITCODE
}
$ErrorActionPreference = $oldErrorAction

if ($pingCode -ne 0) {
  throw "MySQL q_itoffer instance is not reachable on port 3307. $pingOutput"
}

Write-Host "mysqld is alive"
