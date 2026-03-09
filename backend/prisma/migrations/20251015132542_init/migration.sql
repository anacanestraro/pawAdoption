-- CreateTable
CREATE TABLE `AnimalFotos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `url_foto` VARCHAR(500) NOT NULL,
    `validada` BOOLEAN NOT NULL DEFAULT false,
    `data_upload` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
