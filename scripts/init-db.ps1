$ErrorActionPreference = "Stop"
. "$PSScriptRoot\set-env.ps1"

$root = Split-Path -Parent $PSScriptRoot
$mysql = "$env:MYSQL_HOME\bin\mysql.exe"
$mysqladmin = "$env:MYSQL_HOME\bin\mysqladmin.exe"

$oldErrorAction = $ErrorActionPreference
$ErrorActionPreference = "Continue"
& $mysqladmin --protocol=tcp --host=127.0.0.1 --port=3307 --user=root --password=Root@2026 ping 2>&1 | Out-Null
$ErrorActionPreference = $oldErrorAction
$rootArgs = @("--default-character-set=utf8mb4", "--protocol=tcp", "--host=127.0.0.1", "--port=3307", "--user=root", "--password=Root@2026")
$setRootPassword = ""
if ($LASTEXITCODE -ne 0) {
  $oldErrorAction = $ErrorActionPreference
  $ErrorActionPreference = "Continue"
  & $mysqladmin --protocol=tcp --host=127.0.0.1 --port=3307 --user=root ping 2>&1 | Out-Null
  $ErrorActionPreference = $oldErrorAction
  if ($LASTEXITCODE -ne 0) {
    throw "Cannot connect to MySQL root on port 3307."
  }
  $rootArgs = @("--default-character-set=utf8mb4", "--protocol=tcp", "--host=127.0.0.1", "--port=3307", "--user=root")
  $setRootPassword = "ALTER USER 'root'@'localhost' IDENTIFIED BY 'Root@2026';"
}

$bootstrap = @"
CREATE DATABASE IF NOT EXISTS q_itoffer CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
CREATE USER IF NOT EXISTS 'qitoffer_app'@'127.0.0.1' IDENTIFIED BY 'Qitoffer@2026';
CREATE USER IF NOT EXISTS 'qitoffer_app'@'localhost' IDENTIFIED BY 'Qitoffer@2026';
GRANT ALL PRIVILEGES ON q_itoffer.* TO 'qitoffer_app'@'127.0.0.1';
GRANT ALL PRIVILEGES ON q_itoffer.* TO 'qitoffer_app'@'localhost';
$setRootPassword
FLUSH PRIVILEGES;
"@

$bootstrap | & $mysql @rootArgs
& $mysql --default-character-set=utf8mb4 --protocol=tcp --host=127.0.0.1 --port=3307 --user=qitoffer_app --password=Qitoffer@2026 q_itoffer -e "SOURCE $($root -replace '\\','/')/database/schema.sql; SOURCE $($root -replace '\\','/')/database/seed.sql;"
& $mysql --protocol=tcp --host=127.0.0.1 --port=3307 --user=qitoffer_app --password=Qitoffer@2026 -e "SELECT COUNT(*) AS users FROM q_itoffer.users; SELECT COUNT(*) AS jobs FROM q_itoffer.jobs;"
