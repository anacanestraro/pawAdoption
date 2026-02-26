import { Request, Response } from "express";
import prisma from "../lib/client";
import { NovaSolicitacaoDTO } from "../dtos/SolicitacaoAdocaoDTO";
import { AuthRequest } from "../middlewares/auth";

export const listarSolicitacoes = async (req: Request, res: Response) => {
    try {
        const solicitacoes = await prisma.solicitacaoAdocao.findMany({
            include: {
                animal: true,
                adotante: true
            }
        });
        return res.status(200).json(solicitacoes);
    } catch (error) {
        return res.status(500).json({ error: "Erro ao buscar solicitações" });
    }
}

export cont solicitarAdocao