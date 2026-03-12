export interface Usuario {
    id: number;
    nome: string;
    email: string;
    tipo_usuario: 'ADOTANTE' | 'ABRIGO' | 'ADMINISTRADOR';
}

export interface Animal {
    id: number;
    nome: string;
    especie: string;
    raca?: string;
    idade?: number;
    porte?: 'PEQUENO' | 'MEDIO' | 'GRANDE';
    sexo?: 'MACHO' | 'FEMEA';
    descricao?: string;
    status: 'PENDENTE' | 'DISPONIVEL' | 'ADOTADO' | 'PROCESSO_ADOCAO'
    abrigo_id?: number;
    adotante_id?: number
    lar_temporario?: number;
}