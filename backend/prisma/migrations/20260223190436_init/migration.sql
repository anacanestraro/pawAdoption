/*
  Warnings:

  - You are about to drop the column `tipo_validacao` on the `ValidacaoAnimal` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `ValidacaoAnimal` DROP COLUMN `tipo_validacao`,
    MODIFY `status` ENUM('PENDENTE', 'APROVADA', 'REJEITADA') NOT NULL DEFAULT 'PENDENTE';
