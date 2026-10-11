export interface NovaDenunciaDTO {
    motivo: string;
}
export interface ResolverDenunciaDTO {
    acao: 'REMOVER' | 'MANTER';
}