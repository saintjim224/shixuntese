$ErrorActionPreference = "Stop"
. "$PSScriptRoot\set-env.ps1"

if (Get-NetTCPConnection -LocalPort 8080 -ErrorAction SilentlyContinue) {
  Write-Host "Port 8080 is already in use. If this is Tomcat, open http://127.0.0.1:8080/Q_ITOffer/app/"
  exit 0
}

Start-Process -FilePath "$env:CATALINA_HOME\bin\catalina.bat" -ArgumentList "start" -WindowStyle Hidden
Start-Sleep -Seconds 5
Write-Host "Tomcat started. Frontend: http://127.0.0.1:8080/Q_ITOffer/app/"

