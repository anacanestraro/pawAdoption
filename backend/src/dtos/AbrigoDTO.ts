import { EnderecoDTO } from "./EnderecoDTO";
import { NovoUsuarioDTO } from "./UsuarioDTO";

export interface NovoAbrigoDTO extends Omit<NovoUsuarioDTO, "tipo_usuario">{
    cnpj: string;
    razao_social: string;
    capacidade?: number;
    sobre?: string;
    site_url?: string;
    redes_sociais?: string;
}