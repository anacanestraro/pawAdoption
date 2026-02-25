export interface NovaSolicitacaoDTO {
    animal_id: number;
}
export interface AtualizarSolicitacaoDTO {
    status: 'APROVADA' | 'REJEITADA' | 'CANCELADA';
}