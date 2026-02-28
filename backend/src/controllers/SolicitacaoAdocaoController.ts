import { Request, Response } from "express";
import prisma from "../lib/client";
import { AtualizarSolicitacaoDTO, NovaSolicitacaoDTO } from "../dtos/SolicitacaoAdocaoDTO";
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
        console.log(error);
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
            if (req.usuario.tipo_usuario !== 'ABRIGO' && req.usuario.tipo_usuario !== 'ADMINISTRADOR') {
                return res.status(403).json({ error: "Apenas abrigos ou administradores podem aprovar ou rejeitar uma solicitação" });
            }
        }
        const solicitacaoAtualizada = await prisma.solicitacaoAdocao.update({
            where: { id: Number(id) },
            data: {
                status,
                data_resposta: new Date()
            }
        });

        if (status === 'APROVADA') {
            await prisma.animal.update({
                where: { id: solicitacao.animal_id},
                data: {
                    status: 'ADOTADO',
                    adotante_id: solicitacao.adotante_id,
                    data_adocao: new Date()
                }
            })
        } else if (status === 'REJEITADA' || status === 'CANCELADA') {
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