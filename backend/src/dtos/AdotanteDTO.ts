import { EnderecoDTO } from "./EnderecoDTO";
import { NovoUsuarioDTO } from "./UsuarioDTO";

export interface NovoAdotanteDTO extends Omit<NovoUsuarioDTO, "tipo_usuario"> {
  cpf: string;
  data_nascimento?: Date;
  lar_temporario?: boolean;
  capacidade_lar_temporario?: number;
}