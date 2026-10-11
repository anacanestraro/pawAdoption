import { Request, Response } from "express";
import prisma from "../lib/client";
import { AuthRequest } from "../middlewares/auth";
import { NovoVoluntarioDto} from "../dtos/VoluntarioDTO";

// Dados de contato incluídos nas listagens
const selectContato = {
    select: { id: true, nome: true, email: true, telefone: true }
};

export const listarVoluntariosDoAbrigo = async (req: Request, res: Response) => {
    try {

        const { abrigo_id } = req.params;
        const voluntarios = await prisma.voluntario.findMany({
            where: {
                abrigo_id: Number(abrigo_id),
                status: 'ATIVO'
            },
            include: {
                adotante: { include: { usuario: selectContato } },
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
                adotante: { include: { usuario: selectContato } },
            }
        });
        return res.status(200).json(solicitacoes);
    } catch (error) {
        return res.status(500).json({ error: "Erro ao buscar solicitações pendentes" });
    }
}

// Todos os voluntários (qualquer status) do abrigo logado — alimenta a tela de gestão
export const listarVoluntariosRecebidos = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.usuario) {
            return res.status(401).json({ error: "Usuário não autenticado" });
        }

        if (req.usuario.tipo_usuario !== 'ABRIGO') {
            return res.status(403).json({ error: "Apenas abrigos podem gerenciar voluntários" });
        }

        const voluntarios = await prisma.voluntario.findMany({
            where: { abrigo_id: req.usuario.id },
            include: {
                adotante: { include: { usuario: selectContato } },
            },
            orderBy: { data_cadastro: "desc" }
        });
        return res.status(200).json(voluntarios);
    } catch (error) {
        return res.status(500).json({ error: "Erro ao buscar voluntários" });
    }
}

// Adotantes disponíveis como lar temporário — o abrigo encontra e contata por fora (RF11)
export const listarLaresTemporarios = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.usuario) {
            return res.status(401).json({ error: "Usuário não autenticado" });
        }

        if (req.usuario.tipo_usuario !== 'ABRIGO' && req.usuario.tipo_usuario !== 'ADMINISTRADOR') {
            return res.status(403).json({ error: "Apenas abrigos podem buscar lares temporários" });
        }

        const lares = await prisma.adotante.findMany({
            where: {
                lar_temporario: true,
                deleted_at: null,
                usuario: { ativo: true },
            },
            // Só dados de contato e localização — nunca CPF ou data de nascimento
            select: {
                usuario_id: true,
                capacidade_lar_temporario: true,
                usuario: {
                    select: {
                        id: true,
                        nome: true,
                        email: true,
                        telefone: true,
                        endereco: {
                            select: { bairro: true, cidade: true, estado: true }
                        }
                    }
                }
            },
            orderBy: { usuario: { nome: "asc" } }
        });

        return res.status(200).json(lares);
    } catch (error) {
        return res.status(500).json({ error: "Erro ao buscar lares temporários" });
    }
}

export const listarMinhasSolicitacoes = async(req: AuthRequest, res: Response) => {
    try {
        if (!req.usuario) {
            return res.status(401).json({ error: "Usuário não autenticado" });
        }

        const solicitacoes = await prisma.voluntario.findMany({
            where: {
                adotante_id: req.usuario.id,
            },
            include: {
                abrigo: { include: { usuario: selectContato } },
            },
            orderBy: { data_cadastro: "desc" }
        });
        return res.status(200).json(solicitacoes);
    } catch(error) {
        return res.status(500).json({error: "Erro ao buscar solicitações de adotante"});
    }
}

export const solicitarVoluntario = async (req: AuthRequest<NovoVoluntarioDto>, res: Response) => {
    try {
        if (!req.usuario) {
            return res.status(401).json({ error: "Usuário não autenticado" });
        }

        if (req.usuario.tipo_usuario !== 'ADOTANTE') {
            return res.status(403).json({ error: "Apenas adotantes podem se candidatar como voluntários" });
        }

        const adotante_id = req.usuario.id;
        const { abrigo_id } = req.params;
        const { disponibilidade, habilidades } = req.body;

        const solicitacao_existente = await prisma.voluntario.findFirst({
            where: {
                adotante_id: adotante_id,
                abrigo_id: Number(abrigo_id),
            }
        });

        if (solicitacao_existente) {
            return res.status(409).json({ error: "Você já possui uma solicitação para esse abrigo"});
        }

        const solicitacao = await prisma.voluntario.create({
            data: {
                adotante_id: adotante_id,
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

export const aprovarVoluntario = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        if (!req.usuario) {
            return res.status(401).json({ error: "Usuário não autenticado" });
        }

        const solicitacao = await prisma.voluntario.findUnique({
            where: { id: Number(id) }
        });
        if (!solicitacao) {
            return res.status(404).json({ error: "Solicitação não encontrada"});
        }
        if (solicitacao.abrigo_id !== req.usuario.id && req.usuario.tipo_usuario !== 'ADMINISTRADOR') {
            return res.status(403).json({ error: "Apenas o abrigo responsável pode aprovar este voluntário" });
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
        return res.status(500).json({ error: "Erro ao aprovar voluntário" });
    }
}

export const rejeitarVoluntario = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        if (!req.usuario) {
            return res.status(401).json({ error: "Usuário não autenticado" });
        }

        const solicitacao = await prisma.voluntario.findUnique({
            where: { id: Number(id) }
        });
        if (!solicitacao) {
            return res.status(404).json({ error: "Solicitação não encontrada"});
        }
        if (solicitacao.abrigo_id !== req.usuario.id && req.usuario.tipo_usuario !== 'ADMINISTRADOR') {
            return res.status(403).json({ error: "Apenas o abrigo responsável pode rejeitar este voluntário" });
        }
        if (solicitacao.status !== "PENDENTE") {
            return res.status(400).json({error: "Solicitação já foi processada"});
        }
        const rejeitado = await prisma.voluntario.update({
            where: { id: Number(id) },
            data: { status: "REJEITADO" }
        });
        return res.status(200).json(rejeitado);
    } catch (error) {
        return res.status(500).json({ error: "Erro ao rejeitar voluntário" });
    }
}

export const inativarVoluntario = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        if (!req.usuario) {
            return res.status(401).json({ error: "Usuário não autenticado" });
        }

        const solicitacao = await prisma.voluntario.findUnique({
            where: { id: Number(id) }
        });
        if (!solicitacao) {
            return res.status(404).json({ error: "Solicitação não encontrada"});
        }
        if (solicitacao.abrigo_id !== req.usuario.id && req.usuario.tipo_usuario !== 'ADMINISTRADOR') {
            return res.status(403).json({ error: "Apenas o abrigo responsável pode inativar este voluntário" });
        }
        if (solicitacao.status !== "ATIVO") {
            return res.status(400).json({error: "Voluntário não está ativo"});
        }
        const inativado = await prisma.voluntario.update({
            where: { id: Number(id) },
            data: { status: "INATIVO" }
        });
        return res.status(200).json(inativado);
    } catch (error) {
        return res.status(500).json({ error: "Erro ao inativar voluntário" });
    }
}