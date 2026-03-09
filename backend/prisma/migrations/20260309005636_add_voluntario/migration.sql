-- AlterTable
ALTER TABLE `Voluntario` ADD COLUMN `data_cadastro` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `status` ENUM('PENDENTE', 'ATIVO', 'INATIVO', 'REJEITADO') NOT NULL DEFAULT 'PENDENTE';

-- AddForeignKey
ALTER TABLE `Voluntario` ADD CONSTRAINT `Voluntario_adotante_id_fkey` FOREIGN KEY (`adotante_id`) REFERENCES `Adotante`(`usuario_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Voluntario` ADD CONSTRAINT `Voluntario_abrigo_id_fkey` FOREIGN KEY (`abrigo_id`) REFERENCES `Abrigo`(`usuario_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
