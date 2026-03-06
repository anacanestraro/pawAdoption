import { Request, Response } from "express";
import prisma from "../lib/client";
import { AuthRequest } from "../middlewares/auth";
import { NovaDenunciaDTO, AtualizarDenunciaDTO } from "../dtos/DenunciaDTO";

export const listarDenuncias = async (req: Request, res:Response) => {
    try {
        const denuncias = await prisma.denuncia.findMany({
            include: {
                animal: true,
                usuario_denunciante: true,
            }
        });
        return res.status(200).json(denuncias);
    } catch(error) {
        return res.status(500).json({ error: "Erro ao buscar denuncias"});
    }
}

export const denunciar = async (req:AuthRequest<NovaDenunciaDTO>, res: Response) => {
    const { id } = req.params;
    const { motivo } = req.body;

    try {
        if (!req.usuario) {
            return res.status(401).json({ error: "Usuário não autenticado"});
        }

        const animal = await prisma.animal.findUnique({
            where: {id: Number(id)}
        });

        if (!animal) {
            return res.status(404).json({error: "Animal não encontrado"})
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

export const resolverDenuncia = async (req:AuthRequest<AtualizarDenunciaDTO>, res: Response) => {
    const { id } = req.params;

    try {
        if (!req.usuario) {
            return res.status(401).json({error: "Usuário não autenticado"});
        }
        
        if (req.usuario.tipo_usuario !== 'ADMINISTRADOR' ) {
            return res.status(403).json({error: "Apenas administradores podem resolver uma denuncia"})
        }

        const denuncia = await prisma.denuncia.findUnique({
            where: { id: Number(id) }
        });

        if (!denuncia) {
            return res.status(404).json({error: "Denuncia não encontrada"})
        }
        
        if (denuncia.status == 'RESOLVIDA') {
            return res.status(400).json({error: "Denuncia já foi resolvida"})
        }

        const denunciaAtualizada = await prisma.denuncia.update({
            where: { id: Number(id) },
            data: {
                status: 'RESOLVIDA',
                admin_responsavel_id: req.usuario.id,
                data_resolucao: new Date()
            }
        });

        return res.status(200).json(denunciaAtualizada)
    } catch(error) {
        return res.status(500).json({error: "Erro ao resolver denuncia"})
    }
}