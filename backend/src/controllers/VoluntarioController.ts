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

export const solicitarVoluntario = async (req: AuthRequest<NovoVoluntarioDto>, res: Response) => {
    try {
        const adotante_id = req.usuario?.id;
        const { abrigo_id } = req.params;
        const { disponibilidade, habilidades } = req.body;
    
        const solicitacao_existente = await prisma.voluntario.findFirst({
            where: {
                adotante_id: Number(adotante_id),
                abrigo_id: Number(abrigo_id),
            }
        });
    
        if (solicitacao_existente) {
            return res.status(409).json({ error: "Você já possui uma solicitação para esse abrigo"});
        }
    
        const solicitacao = await prisma.voluntario.create({
            data: {
                adotante_id: Number(adotante_id),
                abrigo_id: Number(abrigo_id),
                disponibilidade,
                habilidades,
                status: "PENDENTE"
            }
        });
        return res.status(201).json(solicitacao);
    } catch (error) {
        return res.status(500).json({ error: "Erro ao solicitar voluntariado"});
    }
}

export const aprovarVoluntario = async (req: AuthRequest<AtualizarVoluntarioDTO>, res: Response) => {
    try {
        const { id } = req.params;
        const solicitacao = await prisma.voluntario.findUnique({
            where: { id: Number(id) }
        });
        if (!solicitacao) {
            return res.status(404).json({ error: "Solicitação não encontrada"});
        }
        if (solicitacao.status !== "PENDENTE") {
            return res.status(400).json({error: "Solicitação já foi processada"});
        }
        const aprovado = await prisma.voluntario.update({
            where: { id: Number(id) },
            data: { status: "ATIVO" }
        });
        return res.status(200).json(aprovado);
    } catch (error) {
        return res.status(500).json({ error: "Errro ao aprovar voluntário" });
    }
}

export const rejeitarVoluntario = async (req: AuthRequest<AtualizarVoluntarioDTO>, res: Response) => {
    try {
        const { id } = req.params;
        const solicitacao = await prisma.voluntario.findUnique({
            where: { id: Number(id) }
        });
        if (!solicitacao) {
            return res.status(404).json({ error: "Solicitação não encontrada"});
        }
        if (solicitacao.status !== "PENDENTE") {
            return res.status(400).json({error: "Solicitação já foi processada"});
        }
        const aprovado = await prisma.voluntario.update({
            where: { id: Number(id) },
            data: { status: "REJEITADO" }
        });
        return res.status(200).json(aprovado);
    } catch (error) {
        return res.status(500).json({ error: "Errro ao rejeitar voluntário" });
    }
}

export const inativarVoluntario = async (req: AuthRequest<AtualizarVoluntarioDTO>, res: Response) => {
    try {
        const { id } = req.params;
        const solicitacao = await prisma.voluntario.findUnique({
            where: { id: Number(id) }
        });
        if (!solicitacao) {
            return res.status(404).json({ error: "Solicitação não encontrada"});
        }
        if (solicitacao.status !== "ATIVO") {
            return res.status(400).json({error: "Voluntário não está ativo"});
        }
        const aprovado = await prisma.voluntario.update({
            where: { id: Number(id) },
            data: { status: "INATIVO" }
        });
        return res.status(200).json(aprovado);
    } catch (error) {
        return res.status(500).json({ error: "Errro ao inativar voluntário" });
    }
}