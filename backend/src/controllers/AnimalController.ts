import { Request, Response } from "express";
import prisma from "../lib/client";
import { NovoAnimalDTO } from "../dtos/AnimalDTO";
import { AuthRequest } from "../middlewares/auth";
import { Status } from "@prisma/client";
import { ehDonoDoAnimal } from "../utils/authAnimal";
import { MAX_FOTOS_ANIMAL } from "../middlewares/upload";
import fs from "fs";

// Campos públicos do usuário anunciante (nunca expor senha_hash)
const selectUsuarioPublico = {
    select: { id: true, nome: true, email: true, telefone: true },
};

// Apaga do disco arquivos que o multer já salvou mas que não serão usados
const descartarArquivos = (arquivos: Express.Multer.File[]) => {
    for (const arquivo of arquivos) {
        fs.unlink(arquivo.path, () => {});
    }
};

export const listarAnimais = async (req: Request, res: Response) => {
    try {
        const animais = await prisma.animal.findMany({
            where: {
                deleted_at: null
            },
            include: { fotos: true }
        });
        return res.status(200).json(animais);
    } catch (error) {
        return res.status(500).json({ error: "Erro ao buscar animais" });
    }
}

// Lista apenas os animais do usuário logado.
// ABRIGO   → animais com abrigo_id = usuario.id
// ADOTANTE → animais com lar_temporario_id = usuario.id (cadastrados como lar temporário)
export const listarMeusAnimais = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.usuario) {
            return res.status(401).json({ error: "Usuário não autenticado" });
        }

        const { id, tipo_usuario } = req.usuario;

        if (tipo_usuario !== "ABRIGO" && tipo_usuario !== "ADOTANTE") {
            return res.status(403).json({ error: "Tipo de usuário não possui animais cadastrados" });
        }

        const where =
            tipo_usuario === "ABRIGO"
                ? { abrigo_id: id, deleted_at: null }
                : { lar_temporario_id: id, deleted_at: null };

        const animais = await prisma.animal.findMany({
            where,
            include: { fotos: true },
            orderBy: { created_at: "desc" },
        });

        return res.status(200).json(animais);
    } catch (error) {
        return res.status(500).json({ error: "Erro ao buscar seus animais" });
    }
}

// Relatório dos animais sob cuidados do usuário logado (RF08 / RN15).
// Mesma regra de posse do listarMeusAnimais: abrigo → abrigo_id; adotante → lar_temporario_id.
export const relatorioAnimais = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.usuario) {
            return res.status(401).json({ error: "Usuário não autenticado" });
        }

        const { id, tipo_usuario } = req.usuario;

        if (tipo_usuario !== "ABRIGO" && tipo_usuario !== "ADOTANTE") {
            return res.status(403).json({ error: "Tipo de usuário não possui animais sob cuidados" });
        }

        const where =
            tipo_usuario === "ABRIGO"
                ? { abrigo_id: id, deleted_at: null }
                : { lar_temporario_id: id, deleted_at: null };

        const animais = await prisma.animal.findMany({
            where,
            select: {
                id: true,
                nome: true,
                especie: true,
                raca: true,
                idade: true,
                porte: true,
                sexo: true,
                status: true,
                created_at: true,
                data_adocao: true,
                adotante: {
                    select: { usuario: { select: { nome: true, email: true } } },
                },
            },
            orderBy: { created_at: "desc" },
        });

        const contar = (status: Status) => animais.filter(a => a.status === status).length;

        // Totais por espécie (com quantos já foram adotados)
        const especies = new Map<string, { especie: string; total: number; adotados: number }>();
        for (const a of animais) {
            const chave = a.especie.trim().toLowerCase();
            const item = especies.get(chave) ?? { especie: a.especie.trim(), total: 0, adotados: 0 };
            item.total += 1;
            if (a.status === Status.ADOTADO) item.adotados += 1;
            especies.set(chave, item);
        }

        return res.status(200).json({
            geradoEm: new Date(),
            resumo: {
                total: animais.length,
                disponiveis: contar(Status.DISPONIVEL),
                emProcesso: contar(Status.PROCESSO_ADOCAO),
                pendentes: contar(Status.PENDENTE),
                adotados: contar(Status.ADOTADO),
            },
            porEspecie: [...especies.values()].sort((a, b) => b.total - a.total),
            animais,
        });
    } catch (error) {
        return res.status(500).json({ error: "Erro ao gerar relatório" });
    }
}

export const cadastrarAnimal = async (req: AuthRequest<NovoAnimalDTO>, res: Response) => {
    const dados = req.body;

    try {
        if (!req.usuario) {
            return res.status(401).json({ error: 'Usuário não autenticado' });
        }

        let abrigo_id: number | undefined;
        let lar_temporario_id: number | undefined;

        if (req.usuario.tipo_usuario === 'ABRIGO') {
            abrigo_id = req.usuario.id;
        } else if (req.usuario.tipo_usuario === 'ADOTANTE') {
            lar_temporario_id = req.usuario.id;
        } else {
            return res.status(403).json({ error: 'Tipo de usuário não autorizado a cadastrar animais' });
        }

        const novoAnimal = await prisma.animal.create({
            data: {
                nome: dados.nome,
                especie: dados.especie,
                raca: dados.raca,
                idade: dados.idade,
                porte: dados.porte,
                sexo: dados.sexo,
                descricao: dados.descricao,
                status: req.usuario.tipo_usuario === 'ABRIGO' ? Status.DISPONIVEL : Status.PENDENTE,
                abrigo_id,
                lar_temporario_id,
            },
        });

        return res.status(201).json(novoAnimal);
    } catch (error) {
        return res.status(500).json({ error: "Erro ao cadastrar animal" });
    }
}

export const atualizarAnimal = async (req: AuthRequest<Partial<NovoAnimalDTO>>, res: Response) => {
    const { id } = req.params;
    const dados = req.body;

    try {
        const animalExistente = await prisma.animal.findUnique({
            where: { id: Number(id) },
        });

        if (!animalExistente || animalExistente.deleted_at) {
            return res.status(404).json({ error: "Animal não encontrado" });
        }

        if (!req.usuario) {
            return res.status(401).json({ error: "Usuário não autenticado" });
        }

        if (!ehDonoDoAnimal(req.usuario, animalExistente)) {
            return res.status(403).json({ error: "Você não tem permissão para alterar este animal" });
        }

        const animalAtualizado = await prisma.animal.update({
            where: { id: Number(id) },
            data: {
                nome: dados.nome ?? animalExistente.nome,
                especie: dados.especie ?? animalExistente.especie,
                raca: dados.raca ?? animalExistente.raca,
                idade: dados.idade ?? animalExistente.idade,
                porte: dados.porte ?? animalExistente.porte,
                sexo: dados.sexo ?? animalExistente.sexo,
                descricao: dados.descricao ?? animalExistente.descricao,
                status: dados.status ?? animalExistente.status,
            }
        });

        return res.status(200).json(animalAtualizado);
    } catch (error) {
        return res.status(500).json({ error: "Erro ao atualizar animal" });
    }
}

export const deletarAnimal = async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    try {
        const animal = await prisma.animal.findUnique({
            where: { id: Number(id) }
        });

        if (!animal || animal.deleted_at) {
            return res.status(404).json({ error: "Animal não encontrado" });
        }

        if (!req.usuario) {
            return res.status(401).json({ error: "Usuário não autenticado" });
        }

        if (!ehDonoDoAnimal(req.usuario, animal)) {
            return res.status(403).json({ error: "Você não tem permissão para alterar este animal" });
        }

        await prisma.animal.update({
            where: { id: Number(id) },
            data: { deleted_at: new Date() }
        });

        return res.status(200).json({ message: "Animal desativado com sucesso" });
    } catch (error) {
        return res.status(500).json({ error: "Erro ao desativar animal" });
    }
}

// Recebe de 1 a 5 fotos de uma vez (campo "fotos"); o total do animal não passa de 5
export const uploadFotosAnimal = async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const arquivos = (req.files as Express.Multer.File[] | undefined) ?? [];

    try {
        if (!req.usuario) {
            descartarArquivos(arquivos);
            return res.status(401).json({ error: "Usuário não autenticado" });
        }

        if (arquivos.length === 0) {
            return res.status(400).json({ error: "Nenhuma foto enviada." });
        }

        const animal = await prisma.animal.findUnique({
            where: { id: Number(id) },
            include: { _count: { select: { fotos: true } } },
        });

        if (!animal || animal.deleted_at) {
            descartarArquivos(arquivos);
            return res.status(404).json({ error: "Animal não encontrado." });
        }

        if (!ehDonoDoAnimal(req.usuario, animal)) {
            descartarArquivos(arquivos);
            return res.status(403).json({ error: "Você não tem permissão para alterar este animal" });
        }

        const total = animal._count.fotos + arquivos.length;
        if (total > MAX_FOTOS_ANIMAL) {
            descartarArquivos(arquivos);
            return res.status(400).json({
                error: `Cada animal pode ter no máximo ${MAX_FOTOS_ANIMAL} fotos (este já tem ${animal._count.fotos}).`,
            });
        }

        const fotos = await prisma.$transaction(
            arquivos.map(arquivo =>
                prisma.animalFoto.create({
                    data: {
                        animal_id: Number(id),
                        url_foto: `/uploads/animais/${arquivo.filename}`,
                        validada: false,
                    },
                })
            )
        );

        return res.status(201).json(fotos);
    } catch (error) {
        descartarArquivos(arquivos);
        return res.status(500).json({ error: "Erro ao fazer upload das fotos." });
    }
}

export const animalPorID = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const animal = await prisma.animal.findUnique({
            where: { id: Number(id) },
            include: {
                fotos: true,
                abrigo: {
                    include: { usuario: selectUsuarioPublico }
                },
                lar_temporario: {
                    include: { usuario: selectUsuarioPublico }
                }
            }
        });
        res.set('Cache-Control', 'no-store');
        if (!animal) {
            return res.status(404).json({ error: "Animal não encontrado" });
        }
        return res.status(200).json(animal);
    } catch (error) {
        return res.status(500).json({ error: "Erro ao buscar animal" });
    }
}