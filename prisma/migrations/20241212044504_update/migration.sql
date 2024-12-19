-- AlterTable
ALTER TABLE "Promotion" ADD COLUMN     "redeemed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "userId" INTEGER;
