/*
  Warnings:

  - You are about to drop the column `debe` on the `monthlysummary` table. All the data in the column will be lost.
  - You are about to drop the column `fecha` on the `monthlysummary` table. All the data in the column will be lost.
  - You are about to drop the column `haber` on the `monthlysummary` table. All the data in the column will be lost.
  - You are about to drop the `movementdetail` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `month` to the `MonthlySummary` table without a default value. This is not possible if the table is not empty.
  - Added the required column `year` to the `MonthlySummary` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `movementdetail` DROP FOREIGN KEY `MovementDetail_resumenId_fkey`;

-- AlterTable
ALTER TABLE `monthlysummary` DROP COLUMN `debe`,
    DROP COLUMN `fecha`,
    DROP COLUMN `haber`,
    ADD COLUMN `debit` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `havings` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `month` INTEGER NOT NULL,
    ADD COLUMN `year` INTEGER NOT NULL;

-- DropTable
DROP TABLE `movementdetail`;

-- CreateTable
CREATE TABLE `Detail` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `amount` DOUBLE NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `date` DATETIME(3) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `monthlySummaryId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Detail` ADD CONSTRAINT `Detail_monthlySummaryId_fkey` FOREIGN KEY (`monthlySummaryId`) REFERENCES `MonthlySummary`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
