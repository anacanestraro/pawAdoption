/*
  Warnings:

  - You are about to alter the column `tipo_usuario` on the `Usuario` table. The data in that column could be lost. The data in that column will be cast from `VarChar(100)` to `Enum(EnumId(0))`.

*/
-- AlterTable
ALTER TABLE `Usuario` MODIFY `tipo_usuario` ENUM('ADOTANTE', 'ABRIGO', 'ADMINISTRADOR') NOT NULL;
