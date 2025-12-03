-- AlterTable
ALTER TABLE `Animal` ADD COLUMN `deleted_at` DATETIME(3) NULL;

-- CreateTable
CREATE TABLE `AnimalFoto` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `url_foto` VARCHAR(500) NOT NULL,
    `validada` BOOLEAN NOT NULL DEFAULT false,
    `data_upload` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `animal_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `AnimalFoto` ADD CONSTRAINT `AnimalFoto_animal_id_fkey` FOREIGN KEY (`animal_id`) REFERENCES `Animal`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
