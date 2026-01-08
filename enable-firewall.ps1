# Run this script as Administrator to allow phone connections
# Right-click PowerShell and select "Run as Administrator"

Write-Host "Adding Windows Firewall rule for Inex Backend..." -ForegroundColor Cyan

try {
    New-NetFirewallRule -DisplayName "Inex Backend Server" -Direction Inbound -Protocol TCP -LocalPort 3000 -Action Allow -Profile Any -ErrorAction Stop
    Write-Host "✓ Firewall rule added successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Your phone can now connect to the backend server!" -ForegroundColor Green
} catch {
    Write-Host "✗ Failed to add firewall rule: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please run this script as Administrator:" -ForegroundColor Yellow
    Write-Host "Right-click PowerShell -> Run as Administrator" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
