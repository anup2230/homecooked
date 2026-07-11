-- AlterTable
ALTER TABLE "Dish" ADD COLUMN     "totalServings" INTEGER;

-- AlterTable
ALTER TABLE "PickupSlot" ADD COLUMN     "dishId" TEXT;

-- AddForeignKey
ALTER TABLE "PickupSlot" ADD CONSTRAINT "PickupSlot_dishId_fkey" FOREIGN KEY ("dishId") REFERENCES "Dish"("id") ON DELETE CASCADE ON UPDATE CASCADE;
