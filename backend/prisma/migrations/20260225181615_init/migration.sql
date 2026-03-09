-- CreateTable
CREATE TABLE `SolicitacaoAdocao` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `animal_id` INTEGER NOT NULL,
    `adotante_id` INTEGER NOT NULL,
    `status` ENUM('PENDENTE', 'APROVADA', 'REJEITADA', 'CANCELADA') NOT NULL DEFAULT 'PENDENTE',
    `data_solicitacao` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `data_resposta` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `SolicitacaoAdocao` ADD CONSTRAINT `SolicitacaoAdocao_animal_id_fkey` FOREIGN KEY (`animal_id`) REFERENCES `Animal`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SolicitacaoAdocao` ADD CONSTRAINT `SolicitacaoAdocao_adotante_id_fkey` FOREIGN KEY (`adotante_id`) REFERENCES `Adotante`(`usuario_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
