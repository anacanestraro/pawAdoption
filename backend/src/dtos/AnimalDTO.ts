export interface NovoAnimalDTO {
    nome: string;
    especie: string;
    raca?: string;
    idade?: number;
    porte: "PEQUENO" | "MEDIO" | "GRANDE";
    sexo: "FEMEA" | "MACHO";
    descricao?: string;
    status: "DISPONIVEL" | "ADOTADO" | "PROCESSO_ADOCAO";
}