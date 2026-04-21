-- CreateEnum
CREATE TYPE "MessageType" AS ENUM ('TEXT', 'PICKUP_PROPOSAL');

-- CreateEnum
CREATE TYPE "ProposalStatus" AS ENUM ('PENDING', 'CONFIRMED', 'DECLINED');

-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "messageType" "MessageType" NOT NULL DEFAULT 'TEXT',
ADD COLUMN     "proposalStatus" "ProposalStatus",
ADD COLUMN     "proposedAddress" TEXT,
ADD COLUMN     "proposedTime" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "confirmedPickupAddress" TEXT;
