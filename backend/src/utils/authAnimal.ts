/**
 * Helpers de autorização relacionados a animais.
 * Funções puras: apenas respondem à pergunta, sem tocar em req/res.
 */

type UsuarioAutenticado = {
    id: number;
    tipo_usuario: 'ADOTANTE' | 'ABRIGO' | 'ADMINISTRADOR';
};

type AnimalDono = {
    abrigo_id: number | null;
    lar_temporario_id: number | null;
};

/**
 * Indica se o usuário logado pode alterar o animal.
 * Administradores sempre podem; demais usuários só se forem donos
 * (abrigo dono ou lar temporário dono).
 */
export function ehDonoDoAnimal(
    usuario: UsuarioAutenticado,
    animal: AnimalDono
): boolean {
    if (usuario.tipo_usuario === 'ADMINISTRADOR') {
        return true;
    }

    return (
        animal.abrigo_id === usuario.id ||
        animal.lar_temporario_id === usuario.id
    );
}