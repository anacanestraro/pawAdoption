export interface Usuario {
    id: number;
    nome: string;
    email: string;
    tipo_usuario: 'ADOTANTE' | 'ABRIGO' | 'ADMINISTRADOR';
}