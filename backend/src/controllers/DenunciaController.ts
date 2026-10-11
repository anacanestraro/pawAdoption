import { Response } from "express";
import prisma from "../lib/client";
import { AuthRequest } from "../middlewares/auth";
import { NovaDenunciaDTO, ResolverDenunciaDTO } from "../dtos/DenunciaDTO";
import { ehDonoDoAnimal } from "../utils/authAnimal";

const MOTIVO_MAX = 500;

// Campos públicos de usuário (nunca expor senha_hash)
const selectUsuarioPublico = {
    select: { id: true, nome: true, email: true, telefone: true, tipo_usuario: true },
};

// Lista para a moderação: só administradores (RF13 — revisão por um administrador)
export const listarDenuncias = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.usuario) {
            return res.status(401).json({ error: "Usuário não autenticado" });
        }

        if (req.usuario.tipo_usuario !== 'ADMINISTRADOR') {
            return res.status(403).json({ error: "Apenas administradores podem ver as denúncias" });
        }

        const denuncias = await prisma.denuncia.findMany({
            include: {
                animal: {
                    include: {
                        fotos: true,
                        abrigo: { include: { usuario: selectUsuarioPublico } },
                        lar_temporario: { include: { usuario: selectUsuarioPublico } },
                    }
                },
                usuario_denunciante: selectUsuarioPublico,
            },
            orderBy: { data_denuncia: "desc" },
        });
        return res.status(200).json(denuncias);
    } catch(error) {
        return res.status(500).json({ error: "Erro ao buscar denúncias"});
    }
}

// Qualquer usuário logado pode denunciar um anúncio (animal), exceto o próprio dono
export const denunciar = async (req:AuthRequest<NovaDenunciaDTO>, res: Response) => {
    const { id } = req.params;
    const motivo = (req.body?.motivo ?? "").trim();

    try {
        if (!req.usuario) {
            return res.status(401).json({ error: "Usuário não autenticado"});
        }

        if (!motivo) {
            return res.status(400).json({ error: "Informe o motivo da denúncia" });
        }

        if (motivo.length > MOTIVO_MAX) {
            return res.status(400).json({ error: `O motivo pode ter no máximo ${MOTIVO_MAX} caracteres` });
        }

        const animal = await prisma.animal.findUnique({
            where: {id: Number(id)}
        });

        if (!animal || animal.deleted_at) {
            return res.status(404).json({error: "Anúncio não encontrado"})
        }

        if (req.usuario.tipo_usuario !== 'ADMINISTRADOR' && ehDonoDoAnimal(req.usuario, animal)) {
            return res.status(403).json({ error: "Você não pode denunciar um anúncio seu" });
        }

        const denunciaExistente = await prisma.denuncia.findFirst({
            where: {
                animal_id: Number(id),
                usuario_denunciante_id: req.usuario.id,
                status: 'PENDENTE',
            }
        });

        if (denunciaExistente) {
            return res.status(409).json({ error: "Você já denunciou este anúncio e ele está em análise" });
        }

        const novaDenuncia = await prisma.denuncia.create({
            data: {
                animal_id: Number(id),
                usuario_denunciante_id: req.usuario.id,
                motivo,
                status: 'PENDENTE'
            }
        });

        return res.status(201).json(novaDenuncia);

    } catch(error) {
        return res.status(500).json({ error: "Erro ao denunciar"});
    }
}

// O admin decide: REMOVER o anúncio (soft delete) ou MANTER. As duas opções resolvem a denúncia.
// Remover também resolve as outras denúncias pendentes do mesmo animal.
export const resolverDenuncia = async (req:AuthRequest<ResolverDenunciaDTO>, res: Response) => {
    const { id } = req.params;
    const acao = req.body?.acao;

    try {
        if (!req.usuario) {
            return res.status(401).json({error: "Usuário não autenticado"});
        }

        if (req.usuario.tipo_usuario !== 'ADMINISTRADOR' ) {
            return res.status(403).json({error: "Apenas administradores podem resolver uma denúncia"})
        }

        if (acao !== 'REMOVER' && acao !== 'MANTER') {
            return res.status(400).json({ error: "Ação inválida. Use REMOVER ou MANTER" });
        }

        const denuncia = await prisma.denuncia.findUnique({
            where: { id: Number(id) }
        });

        if (!denuncia) {
            return res.status(404).json({error: "Denúncia não encontrada"})
        }

        if (denuncia.status === 'RESOLVIDA') {
            return res.status(400).json({error: "Denúncia já foi resolvida"})
        }

        const agora = new Date();
        const dadosResolucao = {
            status: 'RESOLVIDA' as const,
            admin_responsavel_id: req.usuario.id,
            data_resolucao: agora,
        };

        if (acao === 'REMOVER') {
            await prisma.$transaction([
                prisma.animal.update({
                    where: { id: denuncia.animal_id },
                    data: { deleted_at: agora },
                }),
                prisma.denuncia.updateMany({
                    where: { animal_id: denuncia.animal_id, status: 'PENDENTE' },
                    data: dadosResolucao,
                }),
            ]);
        } else {
            await prisma.denuncia.update({
                where: { id: Number(id) },
                data: dadosResolucao,
            });
        }

        return res.status(200).json({ id: denuncia.id, acao, status: 'RESOLVIDA' })
    } catch(error) {
        return res.status(500).json({error: "Erro ao resolver denúncia"})
    }
}