# Pickup Management System

Production-grade logistics system replacing manual Outlook-based workflow.

## Features

- **Outlook Calendar Sync**: Automatic sync from Microsoft Outlook
- **Driver Self-Service**: Mobile-first reservation system (no auth required)
- **Loading Confirmation**: Admin workflow for final confirmation
- **PDF Generation**: Automatic Rahtikirja (waybill) generation
- **Admin Dashboard**: Real-time pickup status tracking

## Tech Stack

- TypeScript + Node.js + Express
- SQLite + Prisma ORM
- Microsoft Graph API
- pdf-lib
- Mobile-first web UI

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and fill in your Azure AD credentials:

```bash
cp .env.example .env
```

### 3. Azure AD App Registration

1. Go to [Azure Portal](https://portal.azure.com) → Azure Active Directory → App registrations
2. Create new registration
3. Add API permissions: `Calendars.Read`, `User.Read`
4. Create client secret
5. Copy Tenant ID, Client ID, and Client Secret to `.env`

### 4. Database Setup

```bash
npm run prisma:generate
npm run prisma:migrate
```

### 5. Run Development Server

```bash
npm run dev
```

Server runs on `http://localhost:3000`

## API Endpoints

### Driver Flow
- `POST /api/driver/reserve` - Reserve pickup with reference number + truck plate

### Admin
- `POST /api/admin/confirm-loading/:id` - Confirm loading completion
- `GET /api/admin/pickups` - List all pickups with filters
- `GET /api/admin/pickups/today` - Today's pickups

### Sync
- `POST /api/sync/outlook` - Manual Outlook sync trigger
- `GET /api/sync/status` - Get last sync status

### UI
- `/` - Driver reservation page
- `/admin` - Admin dashboard

## Database Schema

```prisma
model Pickup {
  id               String   @id @default(uuid())
  referenceNumber  String   @unique
  company          String
  scheduledDate    DateTime
  goodsDescription String
  quantity         Int?
  status           PickupStatus @default(PENDING)
  truckPlate       String?
  driverName       String?
  outlookEventId   String?  @unique
  pdfPath          String?
  notes            String?
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
}

enum PickupStatus {
  PENDING
  RESERVED
  LOADED
  COMPLETED
}
```

## Production Deployment

1. Build: `npm run build`
2. Set `NODE_ENV=production` in `.env`
3. Run: `npm start`
4. Configure reverse proxy (nginx/caddy) for HTTPS
5. Setup automatic Outlook sync (cron job or scheduled task)

## Architecture

```
src/
├── server.ts           # Express app entry point
├── config/             # Configuration (DB, Graph API)
├── services/           # Business logic
│   ├── outlook.service.ts
│   ├── pdf.service.ts
│   └── pickup.service.ts
├── routes/             # API endpoints
│   ├── driver.routes.ts
│   ├── admin.routes.ts
│   └── sync.routes.ts
└── public/             # Static web UI
    ├── index.html      # Driver page
    └── admin.html      # Admin dashboard
```

## License

ISC
