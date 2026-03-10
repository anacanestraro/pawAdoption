import { Request, Response } from "express";
import prisma from "../lib/client";
import { AuthRequest } from "../middlewares/auth";
import { NovoVoluntarioDto, AtualizarVoluntarioDTO } from "../dtos/VoluntarioDTO";

export const listarVoluntariosDoAbrigo = async (req: Request, res: Response) => {
    try {

        const { abrigo_id } = req.params;
        const voluntarios = await prisma.voluntario.findMany({
            where: {
                abrigo_id: Number(abrigo_id),
                status: 'ATIVO'
            },
            include: {
                adotante: true,
            }
        });
        return res.status(200).json(voluntarios);
    } catch (error) {
        return res.status(500).json({ error: "Erro ao buscar voluntários do abrigo" });
    }
}

export const listarSolicitacoesPendentes = async (req: AuthRequest, res: Response) => {
    try {
        const { abrigo_id } = req.params;

        if (req.usuario?.id !== Number(abrigo_id)) {
            return res.status(403).json({error: "Apenas o abrigo pode visualizar"})
        }
        const solicitacoes = await prisma.voluntario.findMany({
            where: {
                abrigo_id: Number(abrigo_id),
                status: 'PENDENTE'
            },
            include: {
                adotante: true,
            }
        });
        return res.status(200).json(solicitacoes);
    } catch (error) {
        return res.status(500).json({ error: "Erro ao buscar solicitações pendentes" });
    }
}

export const listarMinhasSolicitacoes = async(req: AuthRequest, res: Response) => {
    try {
        const adotante_id = req.usuario?.id;
        const solicitacoes = await prisma.voluntario.findMany({
            where: {
                adotante_id: Number(adotante_id),
            },
            include: {
                abrigo: true,
            }
        });
        return res.status(200).json(solicitacoes);
    } catch(error) {
        return res.status(500).json({error: "Erro ao buscar solicitações de adotante"});
    }
}