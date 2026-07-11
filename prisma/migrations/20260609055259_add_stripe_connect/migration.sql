-- AlterTable
ALTER TABLE "CookProfile" ADD COLUMN     "stripeAccountId" TEXT,
ADD COLUMN     "stripePayoutsEnabled" BOOLEAN NOT NULL DEFAULT false;
