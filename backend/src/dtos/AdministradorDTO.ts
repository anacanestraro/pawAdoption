import { NovoUsuarioDTO } from "./UsuarioDTO";

export interface NovoAdministrador extends Omit<NovoUsuarioDTO, "tipo_usuario"> {
    nivel_acesso: number;
    departamento: string;
}