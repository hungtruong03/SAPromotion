/*
  Warnings:

  - You are about to drop the column `payload` on the `Promotion` table. All the data in the column will be lost.
  - Added the required column `typeId` to the `Promotion` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "DiscountType" AS ENUM ('Percent', 'Flat');

-- AlterTable
ALTER TABLE "Promotion" DROP COLUMN "payload",
ADD COLUMN     "discountType" "DiscountType" NOT NULL DEFAULT 'Flat',
ADD COLUMN     "discountValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "expiresAt" TIMESTAMP(3),
ADD COLUMN     "image" TEXT,
ADD COLUMN     "typeId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "PromotionType" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "partnerId" INTEGER NOT NULL,

    CONSTRAINT "PromotionType_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Promotion" ADD CONSTRAINT "Promotion_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "PromotionType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
