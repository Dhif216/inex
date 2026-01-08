# Pickup Management System - Quick Start

Write-Host "================================" -ForegroundColor Cyan
Write-Host "Pickup Management System Setup" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check Node.js
Write-Host "Checking Node.js..." -ForegroundColor Yellow
$nodeVersion = node --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Node.js is not installed!" -ForegroundColor Red
    Write-Host "Please install Node.js 18+ from https://nodejs.org" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Node.js $nodeVersion found" -ForegroundColor Green

# Install dependencies
Write-Host ""
Write-Host "Installing dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to install dependencies!" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Dependencies installed" -ForegroundColor Green

# Generate Prisma client
Write-Host ""
Write-Host "Generating Prisma client..." -ForegroundColor Yellow
npm run prisma:generate
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to generate Prisma client!" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Prisma client generated" -ForegroundColor Green

# Create database
Write-Host ""
Write-Host "Creating database..." -ForegroundColor Yellow
Write-Host "When prompted, enter migration name: init" -ForegroundColor Cyan
npm run prisma:migrate
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to create database!" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Database created" -ForegroundColor Green

# Create storage directory
Write-Host ""
Write-Host "Creating storage directory..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path "storage/pdfs" | Out-Null
Write-Host "✓ Storage directory created" -ForegroundColor Green

Write-Host ""
Write-Host "================================" -ForegroundColor Green
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""
Write-Host "IMPORTANT: Configure Azure AD settings in .env file" -ForegroundColor Yellow
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Edit .env file with your Azure AD credentials" -ForegroundColor White
Write-Host "2. See SETUP.md for Azure AD configuration" -ForegroundColor White
Write-Host "3. Run: npm run dev" -ForegroundColor White
Write-Host "4. Open: http://localhost:3000" -ForegroundColor White
Write-Host ""
