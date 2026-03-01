export interface NovaDenunciaDTO {
    motivo?: string;
}
export interface AtualizarDenunciaDTO {
    status: 'PENDENTE' | 'RESOLVIDA';
    data_resolucao?: Date;
}