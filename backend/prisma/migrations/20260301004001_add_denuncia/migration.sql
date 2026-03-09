-- CreateTable
CREATE TABLE `Denuncia` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `animal_id` INTEGER NOT NULL,
    `usuario_denunciante_id` INTEGER NOT NULL,
    `motivo` TEXT NULL,
    `status` ENUM('PENDENTE', 'RESOLVIDA') NOT NULL DEFAULT 'PENDENTE',
    `admin_responsavel_id` INTEGER NULL,
    `data_denuncia` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `data_resolucao` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Denuncia` ADD CONSTRAINT `Denuncia_animal_id_fkey` FOREIGN KEY (`animal_id`) REFERENCES `Animal`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Denuncia` ADD CONSTRAINT `Denuncia_usuario_denunciante_id_fkey` FOREIGN KEY (`usuario_denunciante_id`) REFERENCES `Usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Denuncia` ADD CONSTRAINT `Denuncia_admin_responsavel_id_fkey` FOREIGN KEY (`admin_responsavel_id`) REFERENCES `Administrador`(`usuario_id`) ON DELETE SET NULL ON UPDATE CASCADE;
