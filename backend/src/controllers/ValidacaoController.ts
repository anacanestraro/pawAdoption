import { Request, Response } from "express";
import prisma from "../lib/client";
import { NovaValidacaoDTO } from "../dtos/ValidacaoDTO";
import { AuthRequest } from "../middlewares/auth";

export const listarValidacoes = async (req: Request, res: Response) => {
    try {
        const validacaoAnimal = await prisma.validacaoAnimal.findMany();
        return res.status(200).json(validacaoAnimal);
    } catch (error) {
        return res.status(500).json({ error:"Erro ao buscar validações" });
    }
}

export const cadastrarValidacao = async (req: AuthRequest<NovaValidacaoDTO>, res: Response) => {
    const { status, comentario } = req.body;
    const { id } = req.params;
    try {

        if (!req.usuario){
            return res.status(401).json({error: "Usuário não autenticado"});
        }

        if (req.usuario.tipo_usuario !== 'ADMINISTRADOR') {
            return res.status(403).json({error: "Apenas administradores podem validar animais"})
        }

        const animal = await prisma.animal.findUnique({
            where: { id: Number(id) }
        });

        if(!animal) {
            return res.status(404).json({error: "Animal não encontrado"})
        }

        if (animal.abrigo_id) {
            return res.status(400).json({error: "Animal cadastrado por abrigo não precisa de validação."})
        }

        const validacaoExistente = await prisma.validacaoAnimal.findFirst({
            where: { animal_id: animal?.id, status: 'PENDENTE'}
        });

        if (validacaoExistente) {
            return res.status(400).json({error: "Já existe uma validação pendente para esse animal"})
        }

        const novaValidacao = await prisma.validacaoAnimal.create({
            data: {
                animal_id: animal.id,
                administrador_id: req.usuario!.id,
                status,
                comentario,
            }
        });

        if (status ===  'APROVADA'){
            await prisma.animal.update({
                where: {id: animal.id},
                data:{status: 'DISPONIVEL'}
            })
        }

        return res.status(201).json(novaValidacao);
    } catch(error) {
        return res.status(500).json({error: "Erro ao cadastrar validação"})
    }
}