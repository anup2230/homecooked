-- AlterTable
ALTER TABLE "CookProfile" ADD COLUMN     "dropoffAvailable" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "dropoffNotes" TEXT,
ADD COLUMN     "pickupAddress" TEXT,
ADD COLUMN     "pickupLat" DOUBLE PRECISION,
ADD COLUMN     "pickupLng" DOUBLE PRECISION,
ADD COLUMN     "pickupNeighborhood" TEXT;
