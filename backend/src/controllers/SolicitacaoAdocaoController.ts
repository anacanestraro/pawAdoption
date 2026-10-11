import { Request, Response } from "express";
import prisma from "../lib/client";
import { AtualizarSolicitacaoDTO, NovaSolicitacaoDTO } from "../dtos/SolicitacaoAdocaoDTO";
import { AuthRequest } from "../middlewares/auth";
import { ehDonoDoAnimal } from "../utils/authAnimal";

// Dados incluídos nas listagens para a tela de gerenciamento
const includeSolicitacao = {
    animal: {
        include: { fotos: true }
    },
    adotante: {
        include: {
            usuario: {
                select: { id: true, nome: true, email: true, telefone: true }
            }
        }
    }
};

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

// Solicitações feitas pelo adotante logado
export const listarMinhasSolicitacoes = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.usuario) {
            return res.status(401).json({ error: "Usuário não autenticado" });
        }

        const solicitacoes = await prisma.solicitacaoAdocao.findMany({
            where: { adotante_id: req.usuario.id },
            include: includeSolicitacao,
            orderBy: { data_solicitacao: "desc" }
        });

        return res.status(200).json(solicitacoes);
    } catch (error) {
        return res.status(500).json({ error: "Erro ao buscar suas solicitações" });
    }
}

// Solicitações recebidas para os animais do usuário logado (abrigo ou lar temporário)
export const listarSolicitacoesRecebidas = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.usuario) {
            return res.status(401).json({ error: "Usuário não autenticado" });
        }

        const solicitacoes = await prisma.solicitacaoAdocao.findMany({
            where: {
                animal: {
                    deleted_at: null,
                    OR: [
                        { abrigo_id: req.usuario.id },
                        { lar_temporario_id: req.usuario.id }
                    ]
                }
            },
            include: includeSolicitacao,
            orderBy: { data_solicitacao: "desc" }
        });

        return res.status(200).json(solicitacoes);
    } catch (error) {
        return res.status(500).json({ error: "Erro ao buscar solicitações recebidas" });
    }
}

export const solicitarAdocao = async (req:AuthRequest<NovaSolicitacaoDTO>, res: Response) => {
    const { id } = req.params;
    try {
        
        if (!req.usuario) {
            return res.status(401).json({error: "Usuário não autenticado"});
        }

        if(req.usuario.tipo_usuario !== 'ADOTANTE') {
            return res.status(403).json({error: "Apenas adotantes podem solicitar adoção"})
        }

        const animal = await prisma.animal.findUnique({
            where: {id: Number(id)}
        })

        if(!animal) {
            return res.status(404).json({error:"Animal não encontrado"})
        }

        if(animal.status !== 'DISPONIVEL') {
            return res.status(403).json({error:"Animal não disponível pra adoção"})
        }

        const solicitacaoExistente = await prisma.solicitacaoAdocao.findFirst({
            where: {
                animal_id:Number(id),
                adotante_id: req.usuario.id,
                status: 'PENDENTE'

            }
        });

        if(solicitacaoExistente) {
            return res.status(400).json({ error: "Você já possui uma solicitação pendente para esse animal"})
        }

        const novaSolicitacao = await prisma.solicitacaoAdocao.create({
            data: {
                animal_id: Number(id),
                adotante_id:req.usuario.id,
                status:'PENDENTE'
            }
        });

        return res.status(201).json(novaSolicitacao);

    } catch (error){
        return res.status(500).json({ error: "Erro ao criar solicitação" });
    }
}

export const atualizarSolicitacao = async (req:AuthRequest<AtualizarSolicitacaoDTO>, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
        if (!req.usuario) {
            return res.status(401).json({error: "Usuário não autenticado"});
        }

        const solicitacao = await prisma.solicitacaoAdocao.findUnique({
            where: { id:Number(id) },
            include: { animal:true }
        });

        if (!solicitacao) {
            return res.status(404).json({error:"Solicitação não encontrada"});
        }
        if (solicitacao.status !== 'PENDENTE') {
            return res.status(400).json({error:"Solicitação já foi respondida"});
        }
        if (status === 'CANCELADA') {
            if (req.usuario.id !== solicitacao.adotante_id) {
                return res.status(403).json({ error: "Você só pode cancelar suas próprias solicitações" });
            }
        } else {
            if (!ehDonoDoAnimal(req.usuario, solicitacao.animal)) {
                return res.status(403).json({ error: "Apenas o responsável pelo animal pode aprovar ou rejeitar esta solicitação" });
            }
        }

        if (status === 'APROVADA') {
            if (solicitacao.animal.status === 'ADOTADO') {
                return res.status(400).json({ error: "Este animal já foi adotado" });
            }

            const agora = new Date();

            // Aprova esta, rejeita as outras pendentes do mesmo animal e marca o animal como adotado
            const [solicitacaoAtualizada] = await prisma.$transaction([
                prisma.solicitacaoAdocao.update({
                    where: { id: Number(id) },
                    data: { status: 'APROVADA', data_resposta: agora }
                }),
                prisma.solicitacaoAdocao.updateMany({
                    where: {
                        animal_id: solicitacao.animal_id,
                        status: 'PENDENTE',
                        id: { not: Number(id) }
                    },
                    data: { status: 'REJEITADA', data_resposta: agora }
                }),
                prisma.animal.update({
                    where: { id: solicitacao.animal_id },
                    data: {
                        status: 'ADOTADO',
                        adotante_id: solicitacao.adotante_id,
                        data_adocao: agora
                    }
                })
            ]);

            return res.status(200).json(solicitacaoAtualizada);
        }

        const solicitacaoAtualizada = await prisma.solicitacaoAdocao.update({
            where: { id: Number(id) },
            data: {
                status,
                data_resposta: new Date()
            }
        });

        // Só devolve o animal para DISPONIVEL se ele estava em processo,
        // nunca se já foi adotado
        if (solicitacao.animal.status === 'PROCESSO_ADOCAO') {
            await prisma.animal.update({
                where: { id: solicitacao.animal_id },
                data: { status: 'DISPONIVEL' }
            });
        }

        return res.status(200).json(solicitacaoAtualizada);

    } catch (error) {
        return res.status(500).json({ error: "Erro ao atualizar solicitação"});
    }
}