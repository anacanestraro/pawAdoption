import { NovoUsuarioDTO } from "./UsuarioDTO";

export interface NovoAdministradorDTO extends Omit<NovoUsuarioDTO, "tipo_usuario"> {
    nivel_acesso: number;
    departamento: string;
}