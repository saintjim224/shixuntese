$ErrorActionPreference = "Stop"
. "$PSScriptRoot\set-env.ps1"

$root = Split-Path -Parent $PSScriptRoot
Push-Location "$root\client"
npm install
npm run build
Pop-Location

Push-Location "$root\server"
mvn package
Pop-Location

Copy-Item "$root\server\target\Q_ITOffer.war" "$env:CATALINA_HOME\webapps\Q_ITOffer.war" -Force
Write-Host "WAR deployed to $env:CATALINA_HOME\webapps\Q_ITOffer.war"

