export interface NovaValidacaoDTO {
    animal_id: number;
    status?: 'PENDENTE' | 'APROVADA' | 'REJEITADA';
    comentario?: string;
}

export interface AtualizarValidacaoDTO {
  status: 'PENDENTE' | 'APROVADA' | 'REJEITADA';
  comentario?: string;
}