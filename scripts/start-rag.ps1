param(
  [int]$Port = 8010,
  [string]$HostName = "127.0.0.1"
)

$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent $PSScriptRoot
$RagRoot = Join-Path $ProjectRoot "rag"
$VenvRoot = Join-Path $RagRoot ".venv"
$PythonExe = Join-Path $VenvRoot "Scripts\python.exe"

if (-not (Test-Path $RagRoot)) {
  throw "rag folder not found: $RagRoot"
}

if (-not (Test-Path (Join-Path $RagRoot ".env"))) {
  Copy-Item (Join-Path $RagRoot ".env.example") (Join-Path $RagRoot ".env")
  Write-Host "Created rag/.env from rag/.env.example. Fill RAG_API_KEY later if you need LLM answers."
}

if (-not (Test-Path $PythonExe)) {
  python -m venv $VenvRoot
}

& $PythonExe -m pip install --disable-pip-version-check -r (Join-Path $RagRoot "requirements.txt")

$env:RAG_HOST = $HostName
$env:RAG_PORT = "$Port"
Push-Location $RagRoot
try {
  & $PythonExe -m uvicorn app:app --host $HostName --port $Port
} finally {
  Pop-Location
}
