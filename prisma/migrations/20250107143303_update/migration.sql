/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Promotion` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Promotion` table. All the data in the column will be lost.
  - You are about to drop the column `discountType` on the `Promotion` table. All the data in the column will be lost.
  - You are about to drop the column `discountValue` on the `Promotion` table. All the data in the column will be lost.
  - You are about to drop the column `expiresAt` on the `Promotion` table. All the data in the column will be lost.
  - You are about to drop the column `image` on the `Promotion` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Promotion` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Promotion` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `PromotionType` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Promotion" DROP COLUMN "createdAt",
DROP COLUMN "description",
DROP COLUMN "discountType",
DROP COLUMN "discountValue",
DROP COLUMN "expiresAt",
DROP COLUMN "image",
DROP COLUMN "name",
DROP COLUMN "updatedAt";

-- AlterTable
ALTER TABLE "PromotionType" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "discountType" "DiscountType" NOT NULL DEFAULT 'FLAT',
ADD COLUMN     "discountValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "expiresAt" TIMESTAMP(3),
ADD COLUMN     "image" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
