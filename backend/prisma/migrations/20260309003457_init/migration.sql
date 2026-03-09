-- CreateTable
CREATE TABLE `Voluntario` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `adotante_id` INTEGER NOT NULL,
    `abrigo_id` INTEGER NOT NULL,
    `disponibilidade` TEXT NULL,
    `habilidades` TEXT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
