-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "KitchenApplication" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kitchenName" TEXT NOT NULL,
    "description" TEXT,
    "cuisineTags" TEXT[],
    "permitNumber" TEXT,
    "permitImageUrl" TEXT,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "adminNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KitchenApplication_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "KitchenApplication_userId_key" ON "KitchenApplication"("userId");

-- AddForeignKey
ALTER TABLE "KitchenApplication" ADD CONSTRAINT "KitchenApplication_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
