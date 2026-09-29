# SAMANVAY Single Command Local Dev Runner
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  SAMANVAY (समन्वय) — AI-NWP Operational Command Center   " -ForegroundColor Cyan
Write-Host "  MoES / NCMRWF (PS 26081)                                " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

$API_PATH = Join-Path $PSScriptRoot "api"
$WEB_PATH = Join-Path $PSScriptRoot "web"

Write-Host "[1/2] Starting FastAPI Backend on http://127.0.0.1:8000..." -ForegroundColor Green
$apiProcess = Start-Process -FilePath "python" -ArgumentList "-m uvicorn main:app --host 127.0.0.1 --port 8000 --reload" -WorkingDirectory $API_PATH -PassThru

Start-Sleep -Seconds 2

Write-Host "[2/2] Starting Next.js Web Frontend on http://localhost:3000..." -ForegroundColor Green
$webProcess = Start-Process -FilePath "npm" -ArgumentList "run dev" -WorkingDirectory $WEB_PATH -PassThru

Write-Host "`nSAMANVAY is live!" -ForegroundColor Cyan
Write-Host "API Swagger Docs: http://127.0.0.1:8000/docs" -ForegroundColor Yellow
Write-Host "Web Command App : http://localhost:3000" -ForegroundColor Yellow
Write-Host "`nPress Ctrl+C or close this terminal to terminate."

try {
    Wait-Process -Id $webProcess.Id
} finally {
    Stop-Process -Id $apiProcess.Id -Force -ErrorAction SilentlyContinue
    Stop-Process -Id $webProcess.Id -Force -ErrorAction SilentlyContinue
}
