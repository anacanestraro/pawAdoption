export interface NovaSolicitacaoDTO {
    animal_id: number;
    adotante_id: number;
    status?: 'PENDENTE' | 'APROVADA' | 'REJEITADA' | 'CANCELADA';
}