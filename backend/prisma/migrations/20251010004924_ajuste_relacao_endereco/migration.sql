/*
  Warnings:

  - You are about to drop the column `endereco_id` on the `Usuario` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[usuario_id]` on the table `Endereco` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE `Usuario` DROP FOREIGN KEY `Usuario_endereco_id_fkey`;

-- DropIndex
DROP INDEX `Usuario_endereco_id_fkey` ON `Usuario`;

-- AlterTable
ALTER TABLE `Endereco` ADD COLUMN `usuario_id` INTEGER NULL;

-- AlterTable
ALTER TABLE `Usuario` DROP COLUMN `endereco_id`;

-- CreateIndex
CREATE UNIQUE INDEX `Endereco_usuario_id_key` ON `Endereco`(`usuario_id`);

-- AddForeignKey
ALTER TABLE `Endereco` ADD CONSTRAINT `Endereco_usuario_id_fkey` FOREIGN KEY (`usuario_id`) REFERENCES `Usuario`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
