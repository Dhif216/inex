# Development Guide

## Project Structure

```
pickup-management-system/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── config/
│   │   ├── database.ts        # Prisma client setup
│   │   └── graph.ts           # Microsoft Graph API config
│   ├── services/
│   │   ├── outlook.service.ts # Outlook sync logic
│   │   ├── pickup.service.ts  # Pickup business logic
│   │   └── pdf.service.ts     # PDF generation
│   ├── routes/
│   │   ├── driver.routes.ts   # Driver endpoints
│   │   ├── admin.routes.ts    # Admin endpoints
│   │   └── sync.routes.ts     # Sync endpoints
│   └── server.ts              # Express app
├── public/
│   ├── index.html             # Driver portal
│   └── admin.html             # Admin dashboard
├── storage/
│   └── pdfs/                  # Generated PDFs
└── package.json

```

## Architecture

### Layer Separation

1. **Routes** (`src/routes/`): Handle HTTP requests/responses, validation
2. **Services** (`src/services/`): Business logic, no HTTP concerns
3. **Config** (`src/config/`): External service configuration

### Data Flow

```
Outlook Calendar
    ↓ (sync)
Database (SQLite)
    ↓ (read/write)
Services (Business Logic)
    ↓ (API)
Routes (HTTP Endpoints)
    ↓ (JSON)
Frontend (HTML/JS)
```

## Key Services

### OutlookSyncService

Reads Outlook calendar events via Microsoft Graph API and syncs to database.

```typescript
const service = new OutlookSyncService();
await service.syncCalendarEvents(30); // Sync next 30 days
```

**Event Parsing Logic:**
- Looks for format: `REF-XXX | Company | Goods`
- Falls back to body text parsing
- Creates or updates Pickup records

### PickupService

Manages pickup lifecycle and business rules.

```typescript
const service = new PickupService();

// Reserve pickup
await service.reservePickup('REF-001', 'ABC-123', 'John Doe');

// Confirm loading
await service.confirmLoading(pickupId, 100, 'Notes here');

// Mark completed
await service.markCompleted(pickupId, '/path/to/pdf');
```

**Business Rules:**
- Only today's pickups can be reserved
- Only PENDING pickups can be reserved
- Only RESERVED pickups can be loaded
- Loading confirmation generates PDF and marks COMPLETED

### PDFService

Generates professional Rahtikirja PDFs using pdf-lib.

```typescript
const service = new PDFService();
const pdfPath = await service.generateRahtikirja(pickup);
```

**PDF Includes:**
- Reference number, company, date
- Goods description, quantity
- Truck plate, driver name
- Status, notes, generation timestamp

## API Documentation

### Driver Endpoints

#### Reserve Pickup
```
POST /api/driver/reserve
Content-Type: application/json

{
  "referenceNumber": "REF-12345",
  "truckPlate": "ABC-123",
  "driverName": "John Doe" // optional
}

Response 200:
{
  "success": true,
  "message": "Pickup reserved successfully",
  "pickup": { ... }
}

Response 400:
{
  "success": false,
  "error": "Pickup is scheduled for tomorrow, not today."
}
```

#### Check Pickup
```
GET /api/driver/check/:referenceNumber

Response 200:
{
  "exists": true,
  "isToday": true,
  "canReserve": true,
  "pickup": { ... }
}
```

### Admin Endpoints

#### Confirm Loading
```
POST /api/admin/confirm-loading/:id
Content-Type: application/json

{
  "quantity": 100,
  "notes": "Loaded successfully"
}

Response 200:
{
  "success": true,
  "message": "Loading confirmed and PDF generated",
  "pickup": { ... },
  "pdfPath": "/path/to/pdf"
}
```

#### Get Pickups
```
GET /api/admin/pickups?status=PENDING&company=Acme

Response 200:
{
  "success": true,
  "count": 5,
  "pickups": [ ... ]
}
```

#### Today's Pickups
```
GET /api/admin/pickups/today

Response 200:
{
  "success": true,
  "total": 10,
  "grouped": {
    "pending": [ ... ],
    "reserved": [ ... ],
    "loaded": [ ... ],
    "completed": [ ... ]
  },
  "pickups": [ ... ]
}
```

#### Statistics
```
GET /api/admin/stats

Response 200:
{
  "success": true,
  "stats": {
    "today": {
      "total": 10,
      "pending": 3,
      "reserved": 2,
      "loaded": 1,
      "completed": 4
    },
    "overall": { ... }
  }
}
```

### Sync Endpoints

#### Sync Outlook
```
POST /api/sync/outlook?daysAhead=30

Response 200:
{
  "success": true,
  "message": "Synced 15 events from Outlook",
  "synced": 15,
  "errors": []
}
```

#### Sync Status
```
GET /api/sync/status

Response 200:
{
  "success": true,
  "status": {
    "lastSync": "2025-12-19T10:30:00.000Z",
    "totalPickups": 100,
    "pendingPickups": 15
  }
}
```

## Database Schema

```prisma
model Pickup {
  id               String       @id @default(uuid())
  referenceNumber  String       @unique
  company          String
  scheduledDate    DateTime
  goodsDescription String
  quantity         Int?
  status           PickupStatus @default(PENDING)
  truckPlate       String?
  driverName       String?
  outlookEventId   String?      @unique
  pdfPath          String?
  notes            String?
  createdAt        DateTime     @default(now())
  updatedAt        DateTime     @updatedAt
}

enum PickupStatus {
  PENDING    // Synced from Outlook, waiting
  RESERVED   // Driver reserved today
  LOADED     // Admin confirmed loading
  COMPLETED  // PDF generated
}
```

## Adding Features

### Example: Add Email Notifications

1. Install nodemailer:
```powershell
npm install nodemailer @types/nodemailer
```

2. Create service:
```typescript
// src/services/email.service.ts
export class EmailService {
  async sendReservationConfirmation(pickup: Pickup) {
    // Send email logic
  }
}
```

3. Use in pickup service:
```typescript
// src/services/pickup.service.ts
const emailService = new EmailService();
await emailService.sendReservationConfirmation(updatedPickup);
```

### Example: Add Authentication

1. Install passport:
```powershell
npm install passport passport-local express-session
```

2. Create auth middleware:
```typescript
// src/middleware/auth.ts
export function requireAuth(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
}
```

3. Apply to admin routes:
```typescript
// src/routes/admin.routes.ts
import { requireAuth } from '../middleware/auth';
router.use(requireAuth);
```

## Testing

### Manual Testing

1. Add test pickup:
```powershell
npm run prisma:studio
```

2. Test driver reservation:
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/driver/reserve" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"referenceNumber":"TEST-001","truckPlate":"ABC-123"}'
```

3. Test loading confirmation:
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/admin/confirm-loading/pickup-id" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"quantity":100,"notes":"Test"}'
```

## Debugging

Enable detailed logging:

```typescript
// src/config/database.ts
export const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});
```

View logs in console when running `npm run dev`.

## Performance Optimization

1. **Database Indexing**: Already indexed on referenceNumber, scheduledDate, status
2. **Caching**: Consider adding Redis for frequently accessed data
3. **Batch Operations**: Sync service already batches Outlook events
4. **Connection Pooling**: SQLite has limited concurrency; consider PostgreSQL for high traffic

## Security Considerations

1. **No Authentication**: Driver portal has no auth (by design)
2. **Admin Panel**: Consider adding authentication
3. **Input Validation**: Added basic validation, enhance as needed
4. **SQL Injection**: Prevented by Prisma ORM
5. **CORS**: Currently open, restrict in production
6. **Rate Limiting**: Consider adding for public endpoints

## Maintenance

### Database Backup

```powershell
# Manual backup
Copy-Item "prisma\dev.db" "backups\backup-$(Get-Date -Format 'yyyy-MM-dd').db"

# Automated daily backup (Task Scheduler)
$trigger = New-ScheduledTaskTrigger -Daily -At 2am
$action = New-ScheduledTaskAction -Execute "powershell" `
  -Argument "-File backup-db.ps1"
Register-ScheduledTask -TaskName "DBBackup" -Trigger $trigger -Action $action
```

### Log Rotation

Consider adding log rotation for production:

```powershell
npm install winston
```

### Monitoring

Add health check monitoring:

```powershell
# Check server health every 5 minutes
while($true) {
  $response = Invoke-RestMethod -Uri "http://localhost:3000/api/health"
  if($response.status -ne "ok") {
    # Send alert
  }
  Start-Sleep -Seconds 300
}
```
