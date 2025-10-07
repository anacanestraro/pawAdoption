-- CreateTable
CREATE TABLE `Adotante` (
    `usuario_id` INTEGER NOT NULL,
    `cpf` VARCHAR(14) NULL,
    `data_nascimento` DATETIME(3) NULL,
    `lar_temporario` BOOLEAN NOT NULL DEFAULT false,
    `capacidade_lar_temporario` INTEGER NULL,

    UNIQUE INDEX `Adotante_cpf_key`(`cpf`),
    PRIMARY KEY (`usuario_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Adotante` ADD CONSTRAINT `Adotante_usuario_id_fkey` FOREIGN KEY (`usuario_id`) REFERENCES `Usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
