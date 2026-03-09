export interface NovoVoluntarioDto {
    disponibilidade?: string;
    habilidades?: string;
}

export interface AtualizarVoluntarioDTO {
    status: 'PENDENTE' | 'ATIVO' | 'INATIVO' | 'REJEITADO';
}