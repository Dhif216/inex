# 🚀 Quick Installation Commands

## Step-by-Step Installation

### Option 1: Automated Setup (Recommended)

```powershell
# Navigate to project directory
cd C:\Users\dhif_\OneDrive\Desktop\Inex

# Run automated setup
.\setup.ps1

# Edit .env with your Azure AD credentials
notepad .env

# Start the server
npm run dev
```

### Option 2: Manual Setup

```powershell
# 1. Install dependencies
npm install

# 2. Generate Prisma Client
npm run prisma:generate

# 3. Create database (when prompted, enter: init)
npm run prisma:migrate

# 4. Create storage directory
New-Item -ItemType Directory -Force -Path "storage/pdfs"

# 5. Configure environment
notepad .env
# Add your Azure AD credentials

# 6. Start development server
npm run dev
```

## Azure AD Configuration

### Get Your Credentials

1. **Go to Azure Portal**
   ```
   https://portal.azure.com
   ```

2. **Navigate to App Registration**
   ```
   Azure Active Directory → App registrations → New registration
   ```

3. **Create App**
   - Name: "Pickup Management System"
   - Click "Register"

4. **Copy IDs**
   - Copy "Application (client) ID" → AZURE_CLIENT_ID
   - Copy "Directory (tenant) ID" → AZURE_TENANT_ID

5. **Create Secret**
   ```
   Certificates & secrets → New client secret → Add
   ```
   - Copy the VALUE (not ID) → AZURE_CLIENT_SECRET

6. **Add Permissions**
   ```
   API permissions → Add a permission → Microsoft Graph → Application permissions
   ```
   - Add: Calendars.Read
   - Add: User.Read.All
   - Click "Grant admin consent for..."

### Update .env File

```env
AZURE_TENANT_ID=your-tenant-id-here
AZURE_CLIENT_ID=your-client-id-here
AZURE_CLIENT_SECRET=your-secret-value-here
OUTLOOK_USER_EMAIL=your-email@company.com
```

## Test the System

### 1. Check Server Health

```powershell
# Open browser
Start-Process "http://localhost:3000/api/health"

# Or use PowerShell
Invoke-RestMethod -Uri "http://localhost:3000/api/health"
```

### 2. Test Outlook Sync

```powershell
# Via API
Invoke-RestMethod -Uri "http://localhost:3000/api/sync/outlook" -Method POST

# Or use Admin Dashboard
Start-Process "http://localhost:3000/admin"
# Click "🔄 Sync Outlook" button
```

### 3. Add Test Pickup (Without Outlook)

```powershell
# Open Prisma Studio
npm run prisma:studio

# Add a pickup manually:
# - referenceNumber: TEST-001
# - company: Test Company
# - scheduledDate: [Today's date]
# - goodsDescription: Test goods
# - status: PENDING
```

### 4. Test Driver Reservation

```powershell
# Open driver portal
Start-Process "http://localhost:3000"

# Or test via API
$body = @{
    referenceNumber = "TEST-001"
    truckPlate = "ABC-123"
    driverName = "Test Driver"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/driver/reserve" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body
```

### 5. Test Loading Confirmation

```powershell
# 1. Get today's pickups to find ID
$pickups = Invoke-RestMethod -Uri "http://localhost:3000/api/admin/pickups/today"
$pickupId = $pickups.pickups[0].id

# 2. Confirm loading
$body = @{
    quantity = 100
    notes = "Test loading"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/admin/confirm-loading/$pickupId" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body

# 3. Check for generated PDF
Get-ChildItem -Path "storage/pdfs"
```

## Production Build

### Build for Production

```powershell
# Build TypeScript
npm run build

# Check output
Get-ChildItem -Path "dist" -Recurse

# Test production build
$env:NODE_ENV = "production"
npm start
```

### Using PM2 Process Manager

```powershell
# Install PM2 globally
npm install -g pm2

# Build the project
npm run build

# Start with PM2
pm2 start dist/server.js --name pickup-system

# View logs
pm2 logs pickup-system

# Monitor
pm2 monit

# Setup auto-restart on reboot
pm2 startup
pm2 save
```

## Scheduled Outlook Sync

### Windows Task Scheduler

```powershell
# Create scheduled task (runs every 30 minutes)
$action = New-ScheduledTaskAction -Execute "curl.exe" `
    -Argument "http://localhost:3000/api/sync/outlook -X POST"

$trigger = New-ScheduledTaskTrigger -Once -At (Get-Date) `
    -RepetitionInterval (New-TimeSpan -Minutes 30) `
    -RepetitionDuration ([TimeSpan]::MaxValue)

$principal = New-ScheduledTaskPrincipal -UserId "$env:USERDOMAIN\$env:USERNAME" `
    -LogonType ServiceAccount -RunLevel Highest

Register-ScheduledTask -TaskName "OutlookPickupSync" `
    -Action $action `
    -Trigger $trigger `
    -Principal $principal `
    -Description "Sync Outlook calendar to Pickup Management System"

# Verify task created
Get-ScheduledTask -TaskName "OutlookPickupSync"
```

## Database Backup

### Manual Backup

```powershell
# Backup database
Copy-Item "prisma\dev.db" "backups\backup-$(Get-Date -Format 'yyyy-MM-dd-HHmm').db"
```

### Automated Daily Backup

```powershell
# Create backup script
@"
`$date = Get-Date -Format 'yyyy-MM-dd'
`$backupPath = "C:\backups\pickup-system"
if (-not (Test-Path `$backupPath)) {
    New-Item -ItemType Directory -Path `$backupPath
}
Copy-Item "C:\Users\dhif_\OneDrive\Desktop\Inex\prisma\dev.db" `
    "`$backupPath\backup-`$date.db"
"@ | Out-File -FilePath "backup-db.ps1"

# Schedule daily backup at 2 AM
$action = New-ScheduledTaskAction -Execute "powershell.exe" `
    -Argument "-File backup-db.ps1"

$trigger = New-ScheduledTaskTrigger -Daily -At 2am

Register-ScheduledTask -TaskName "PickupDBBackup" `
    -Action $action `
    -Trigger $trigger `
    -Description "Daily backup of Pickup Management database"
```

## Troubleshooting Commands

### Check Node.js Version

```powershell
node --version  # Should be 18+
npm --version
```

### Clear and Reinstall

```powershell
# Remove node_modules and reinstall
Remove-Item -Recurse -Force node_modules, package-lock.json
npm install
```

### Reset Database

```powershell
# Delete database and recreate
Remove-Item prisma\dev.db, prisma\dev.db-journal -ErrorAction SilentlyContinue
npm run prisma:migrate
```

### View Logs

```powershell
# If using PM2
pm2 logs pickup-system

# If running directly
# Logs appear in console where you ran npm run dev
```

### Check Port Usage

```powershell
# Check what's using port 3000
Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue

# Kill process using port 3000
$processId = (Get-NetTCPConnection -LocalPort 3000).OwningProcess
Stop-Process -Id $processId -Force
```

### Test API Endpoints

```powershell
# Health check
Invoke-RestMethod http://localhost:3000/api/health

# Get sync status
Invoke-RestMethod http://localhost:3000/api/sync/status

# Get today's pickups
Invoke-RestMethod http://localhost:3000/api/admin/pickups/today

# Get stats
Invoke-RestMethod http://localhost:3000/api/admin/stats
```

## Useful Development Commands

```powershell
# Development with auto-reload
npm run dev

# Build TypeScript
npm run build

# Start production server
npm start

# Open Prisma Studio (database GUI)
npm run prisma:studio

# Generate Prisma Client (after schema changes)
npm run prisma:generate

# Create new migration
npm run prisma:migrate

# View TypeScript errors
npx tsc --noEmit
```

## Access URLs

- **Driver Portal**: http://localhost:3000/
- **Admin Dashboard**: http://localhost:3000/admin
- **API Health**: http://localhost:3000/api/health
- **Prisma Studio**: http://localhost:5555 (when running `npm run prisma:studio`)

## Next Steps After Installation

1. ✅ Verify server starts without errors
2. ✅ Configure Azure AD credentials in .env
3. ✅ Test Outlook sync
4. ✅ Create test pickup (manual or via Outlook)
5. ✅ Test driver reservation flow
6. ✅ Test admin confirmation flow
7. ✅ Verify PDF generation
8. ✅ Setup scheduled Outlook sync
9. ✅ Setup database backups
10. ✅ Deploy to production server (optional)

---

**Need Help?**
- Check [SETUP.md](SETUP.md) for detailed setup instructions
- Check [OVERVIEW.md](OVERVIEW.md) for architecture and features
- Check [DEVELOPMENT.md](DEVELOPMENT.md) for developer information
