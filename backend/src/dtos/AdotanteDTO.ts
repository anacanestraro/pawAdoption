import { EnderecoDTO } from "./EnderecoDTO";

export interface NovoAdotanteDTO {
  nome: string;
  email: string;
  senha: string;
  telefone?: string;
  endereco?: EnderecoDTO;
  cpf?: string;
  data_nascimento?: Date;
  lar_temporario?: boolean;
  capacidade_lar_temporario?: number;
}
