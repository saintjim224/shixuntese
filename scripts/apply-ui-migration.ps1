$ErrorActionPreference = "Stop"
. "$PSScriptRoot\set-env.ps1"

$root = Split-Path -Parent $PSScriptRoot
$mysql = Join-Path $env:MYSQL_HOME "bin\mysql.exe"

Push-Location $root
try {
  $mysqlArgs = @(
    "--default-character-set=utf8mb4",
    "--protocol=tcp",
    "--host=127.0.0.1",
    "--port=3307",
    "--user=qitoffer_app",
    "--password=Qitoffer@2026",
    "q_itoffer"
  )
  $quotedArgs = ($mysqlArgs | ForEach-Object { '"' + ($_ -replace '"', '\"') + '"' }) -join " "
  $command = '"' + $mysql + '" ' + $quotedArgs + ' < database\migration-20260706-ui-iteration.sql'
  cmd /c $command
  if ($LASTEXITCODE -ne 0) {
    throw "UI iteration migration failed with exit code $LASTEXITCODE."
  }
  Write-Host "UI iteration migration applied."
}
finally {
  Pop-Location
}
