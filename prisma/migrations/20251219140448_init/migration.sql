-- CreateTable
CREATE TABLE "Pickup" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "referenceNumber" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "scheduledDate" DATETIME NOT NULL,
    "goodsDescription" TEXT NOT NULL,
    "quantity" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "truckPlate" TEXT,
    "driverName" TEXT,
    "outlookEventId" TEXT,
    "pdfPath" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Pickup_referenceNumber_key" ON "Pickup"("referenceNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Pickup_outlookEventId_key" ON "Pickup"("outlookEventId");

-- CreateIndex
CREATE INDEX "Pickup_referenceNumber_idx" ON "Pickup"("referenceNumber");

-- CreateIndex
CREATE INDEX "Pickup_scheduledDate_idx" ON "Pickup"("scheduledDate");

-- CreateIndex
CREATE INDEX "Pickup_status_idx" ON "Pickup"("status");
