-- CreateTable
CREATE TABLE `Animal` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(100) NOT NULL,
    `especie` VARCHAR(50) NOT NULL,
    `raca` VARCHAR(100) NULL,
    `idade` INTEGER NULL,
    `porte` ENUM('PEQUENO', 'MEDIO', 'GRANDE') NOT NULL,
    `sexo` ENUM('FEMEA', 'MACHO') NOT NULL,
    `descricao` TEXT NULL,
    `status` ENUM('DISPONIVEL', 'ADOTADO', 'PROCESSO_ADOCAO') NOT NULL DEFAULT 'DISPONIVEL',
    `data_adocao` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `abrigo_id` INTEGER NULL,
    `lar_temporario_id` INTEGER NULL,
    `adotante_id` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Animal` ADD CONSTRAINT `Animal_abrigo_id_fkey` FOREIGN KEY (`abrigo_id`) REFERENCES `Abrigo`(`usuario_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Animal` ADD CONSTRAINT `Animal_lar_temporario_id_fkey` FOREIGN KEY (`lar_temporario_id`) REFERENCES `Adotante`(`usuario_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Animal` ADD CONSTRAINT `Animal_adotante_id_fkey` FOREIGN KEY (`adotante_id`) REFERENCES `Adotante`(`usuario_id`) ON DELETE SET NULL ON UPDATE CASCADE;
