# Start local server + public link for phone testing
# Keep this window open while sharing the link

Set-Location $PSScriptRoot\..

Write-Host "Building site..." -ForegroundColor Cyan
npm run build
if ($LASTEXITCODE -ne 0) { exit 1 }

Write-Host ""
Write-Host "Starting server on port 4173..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; npx serve dist -l 4173 --no-port-switching"

Start-Sleep -Seconds 3

Write-Host ""
Write-Host "Creating public link (keep this window open)..." -ForegroundColor Cyan
Write-Host "Copy the https://....trycloudflare.com URL below and send it to her phone." -ForegroundColor Yellow
Write-Host ""

npx cloudflared tunnel --url http://127.0.0.1:4173
