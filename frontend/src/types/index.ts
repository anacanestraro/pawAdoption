export interface Usuario {
    id: number;
    nome: string;
    email: string;
    tipo_usuario: 'ADOTANTE' | 'ABRIGO' | 'ADMINISTRADOR';
    created_at: Date;
    updated_at: Date;
    deleted_at?: Date;
}

export interface Adotante extends Usuario {
    usuario_id: number;
    cpf: string;
    data_nascimento: Date;
    lar_temporario: boolean;
    capacidade_lar_temporario: number;
    created_at: Date;
    updated_at: Date;
    deleted_at?: Date;
}

export interface Abrigo extends Usuario {
    usuario_id: number;
    cnpj: string;
    razao_social: string;
    capacidade?: number;
    sobre?: string;
    site_url?: string;
    reder_sociais?: string;
    created_at: Date;
    updated_at: Date;
    deleted_at?: Date;
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
    created_at: Date;
    deleted_at?: Date;
}

