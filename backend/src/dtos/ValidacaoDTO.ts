export interface NovaValidacaoDTO {
    animal_id: number;
    tipo_validacao: 'FOTO' | 'DADOS';
    comentario?: string;
}

export interface AtualizarValidacaoDTO {
  status: 'PENDENTE' | 'APROVADA' | 'REJEITADA';
  comentario?: string;
}