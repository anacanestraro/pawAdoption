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

export const solicitarAdocao = async (req:AuthRequest<NovaSolicitacaoDTO>, res: Response) => {
    const { animal_id } = req.params;
    try {
        
        if (!req.usuario) {
            return res.status(401).json({error: "Usuário não autenticado"});
        }

        if(req.usuario.tipo_usuario !== 'ADOTANTE') {
            return res.status(403).json({error: "Apenas adotantes podem solicitar adoção"})
        }

        const animal = await prisma.animal.findUnique({
            where: {id: Number(animal_id)}
        })

        if(!animal) {
            return res.status(404).json({error:"Animal não encontrado"})
        }

        if(animal.status !== 'DISPONIVEL') {
            return res.status(403).json({error:"Animal não disponível pra adoção"})
        }

        const solicitacaoExistente = await prisma.solicitacaoAdocao.findFirst({
            where: {
                animal_id:Number(animal_id),
                adotante_id: req.usuario.id,
                status: 'PENDENTE'

            }
        });

        if(solicitacaoExistente) {
            return res.status(400).json({ error: "Você já possui uma solicitação pendente para esse animal"})
        }

        const novaSolicitacao = await prisma.solicitacaoAdocao.create({
            data: {
                animal_id: Number(animal_id),
                adotante_id:req.usuario.id,
                status:'PENDENTE'
            }
        });

        return res.status(201).json(novaSolicitacao);

    } catch (error){
        return res.status(500).json({ error: "Erro ao criar solicitação" });
    }

}