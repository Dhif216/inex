-- AlterTable
ALTER TABLE "Pickup" ADD COLUMN "destination" TEXT;
ALTER TABLE "Pickup" ADD COLUMN "driverCompany" TEXT;
ALTER TABLE "Pickup" ADD COLUMN "imageUrl" TEXT;
ALTER TABLE "Pickup" ADD COLUMN "loadingEndTime" DATETIME;
ALTER TABLE "Pickup" ADD COLUMN "loadingStartTime" DATETIME;
ALTER TABLE "Pickup" ADD COLUMN "pickupLocation" TEXT;
ALTER TABLE "Pickup" ADD COLUMN "qrCode" TEXT;
