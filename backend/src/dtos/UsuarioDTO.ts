import { EnderecoDTO } from "./EnderecoDTO";

export interface NovoUsuarioDTO {
  nome: string;
  email: string;
  senha: string;
  telefone?: string;
  tipo_usuario: "ADOTANTE" | "ABRIGO" | "ADMINISTRADOR";
  endereco?: EnderecoDTO;
}