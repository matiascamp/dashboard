-- AlterTable
ALTER TABLE "MovementDetail" ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'ARS',
ADD COLUMN     "dollarRate" DOUBLE PRECISION,
ADD COLUMN     "amountOriginal" DOUBLE PRECISION;
