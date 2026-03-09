-- CreateTable
CREATE TABLE `ValidacaoAnimal` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `animal_id` INTEGER NOT NULL,
    `administrador_id` INTEGER NOT NULL,
    `tipo_validacao` ENUM('FOTO', 'DADOS') NOT NULL,
    `status` ENUM('PENDENTE', 'APROVADA', 'REJEITADA') NOT NULL,
    `comentario` VARCHAR(191) NULL,
    `data_validacao` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ValidacaoAnimal` ADD CONSTRAINT `ValidacaoAnimal_animal_id_fkey` FOREIGN KEY (`animal_id`) REFERENCES `Animal`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ValidacaoAnimal` ADD CONSTRAINT `ValidacaoAnimal_administrador_id_fkey` FOREIGN KEY (`administrador_id`) REFERENCES `Administrador`(`usuario_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
