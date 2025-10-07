/*
  Warnings:

  - Made the column `cpf` on table `Adotante` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `Adotante` MODIFY `cpf` VARCHAR(14) NOT NULL;

-- CreateTable
CREATE TABLE `Abrigo` (
    `usuario_id` INTEGER NOT NULL,
    `cnpj` VARCHAR(18) NOT NULL,
    `razao_social` VARCHAR(255) NOT NULL,
    `capacidade` INTEGER NULL DEFAULT 0,
    `sobre` TEXT NULL,
    `site_url` VARCHAR(255) NOT NULL,
    `redes_sociais` TEXT NULL,

    UNIQUE INDEX `Abrigo_cnpj_key`(`cnpj`),
    PRIMARY KEY (`usuario_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Abrigo` ADD CONSTRAINT `Abrigo_usuario_id_fkey` FOREIGN KEY (`usuario_id`) REFERENCES `Usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
