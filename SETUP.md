# Quick Setup Guide

## Prerequisites
- Node.js 18+ installed
- Azure AD tenant access (for Outlook integration)
- Git (optional)

## Step 1: Install Dependencies

Open PowerShell in the project directory and run:

```powershell
npm install
```

## Step 2: Configure Environment

Copy the example environment file:

```powershell
Copy-Item .env.example .env
```

Edit the `.env` file with your Azure AD credentials:

```env
PORT=3000
DATABASE_URL="file:./dev.db"

# Get these from Azure Portal
AZURE_TENANT_ID=your-tenant-id-here
AZURE_CLIENT_ID=your-client-id-here
AZURE_CLIENT_SECRET=your-client-secret-here

# Your Outlook email
OUTLOOK_USER_EMAIL=your-email@company.com

PDF_STORAGE_PATH=./storage/pdfs
```

## Step 3: Setup Azure AD App Registration

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to **Azure Active Directory** → **App registrations**
3. Click **New registration**
   - Name: "Pickup Management System"
   - Supported account types: "Accounts in this organizational directory only"
   - Click **Register**

4. Copy the **Application (client) ID** and **Directory (tenant) ID** to your `.env` file

5. Go to **Certificates & secrets** → **New client secret**
   - Description: "API Access"
   - Expires: 24 months
   - Click **Add**
   - Copy the **Value** (not the ID) to `.env` as `AZURE_CLIENT_SECRET`

6. Go to **API permissions** → **Add a permission**
   - Select **Microsoft Graph** → **Application permissions**
   - Add these permissions:
     - `Calendars.Read`
     - `User.Read.All`
   - Click **Grant admin consent**

## Step 4: Initialize Database

```powershell
# Generate Prisma client
npm run prisma:generate

# Create database and run migrations
npm run prisma:migrate
```

When prompted for a migration name, enter: `init`

## Step 5: Start the Server

```powershell
# Development mode (with auto-reload)
npm run dev

# Production mode
npm run build
npm start
```

The server will start on `http://localhost:3000`

## Step 6: Access the Application

- **Driver Portal**: http://localhost:3000/
- **Admin Dashboard**: http://localhost:3000/admin

## Step 7: Sync Outlook Calendar

1. Open the Admin Dashboard
2. Click "🔄 Sync Outlook" button
3. Or use the API:
   ```powershell
   Invoke-RestMethod -Uri "http://localhost:3000/api/sync/outlook" -Method POST
   ```

## Outlook Event Format

For automatic parsing, format your Outlook calendar events like this:

**Subject:**
```
REF-12345 | Company Name | Goods Description
```

**Alternative (in event body):**
```
REF: REF-12345
Company: Company Name
Goods: Goods Description
```

## Testing Without Outlook

You can manually add test pickups to the database:

```powershell
# Open Prisma Studio
npm run prisma:studio
```

Then add a pickup manually with:
- referenceNumber: `TEST-001`
- company: `Test Company`
- scheduledDate: Today's date
- goodsDescription: `Test goods`
- status: `PENDING`

## Troubleshooting

### Error: "Missing required Azure AD configuration"
- Check that all Azure credentials are set in `.env`
- Ensure there are no spaces or quotes around values

### Error: "Failed to acquire access token"
- Verify Azure App Registration is complete
- Check that admin consent was granted for API permissions
- Ensure client secret hasn't expired

### Database errors
- Delete `dev.db` and run `npm run prisma:migrate` again
- Check that `DATABASE_URL` in `.env` is correct

### Port already in use
- Change `PORT` in `.env` to a different number (e.g., 3001)

## Production Deployment

1. Set `NODE_ENV=production` in `.env`
2. Use a process manager:
   ```powershell
   npm install -g pm2
   npm run build
   pm2 start dist/server.js --name pickup-system
   ```

3. Setup automatic Outlook sync (Windows Task Scheduler):
   ```powershell
   # Create a scheduled task that runs every 30 minutes:
   $trigger = New-ScheduledTaskTrigger -Once -At (Get-Date) -RepetitionInterval (New-TimeSpan -Minutes 30)
   $action = New-ScheduledTaskAction -Execute "curl" -Argument "http://localhost:3000/api/sync/outlook -X POST"
   Register-ScheduledTask -TaskName "OutlookSync" -Trigger $trigger -Action $action
   ```

4. Configure reverse proxy (IIS/nginx) for HTTPS

## Next Steps

- Test the driver reservation flow
- Test loading confirmation and PDF generation
- Setup automated backups of the SQLite database
- Configure email notifications (optional)
- Add authentication for admin panel (optional)
