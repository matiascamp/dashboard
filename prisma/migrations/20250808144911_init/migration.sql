-- CreateTable
CREATE TABLE `MonthlySummary` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `fecha` DATETIME(3) NOT NULL,
    `debe` DOUBLE NOT NULL,
    `haber` DOUBLE NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MovementDetail` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `monto` DOUBLE NOT NULL,
    `descripcion` VARCHAR(191) NOT NULL,
    `fecha` DATETIME(3) NOT NULL,
    `nombre` VARCHAR(191) NOT NULL,
    `resumenId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `MovementDetail` ADD CONSTRAINT `MovementDetail_resumenId_fkey` FOREIGN KEY (`resumenId`) REFERENCES `MonthlySummary`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
