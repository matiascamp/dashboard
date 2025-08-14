/*
  Warnings:

  - You are about to drop the `detail` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `detail` DROP FOREIGN KEY `Detail_monthlySummaryId_fkey`;

-- DropTable
DROP TABLE `detail`;

-- CreateTable
CREATE TABLE `MovementDetail` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `amount` DOUBLE NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `date` DATETIME(3) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `monthlySummaryId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Budgets` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `createdDate` DATETIME(3) NOT NULL,
    `clientName` VARCHAR(191) NOT NULL,
    `pdfUrl` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `MovementDetail` ADD CONSTRAINT `MovementDetail_monthlySummaryId_fkey` FOREIGN KEY (`monthlySummaryId`) REFERENCES `MonthlySummary`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
