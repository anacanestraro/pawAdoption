import {Request, Response} from "express";
import prisma from "../lib/client";
import { NovoAnimalDTO } from "../dtos/AnimalDTO";
import { AuthRequest } from "../middlewares/auth";

export const listarAnimais = async (req: Request, res: Response) => {
    try {
        const animais = await prisma.animal.findMany({
            where: {
                deleted_at: null
            }
        });
        return res.status(200).json(animais);
    }catch(error) {
        return res.status(500).json({error: "Erro ao buscar animais"});
    }
}

export const cadastrarAnimal  = async (req: AuthRequest<NovoAnimalDTO>, res: Response) => {
    const dados = req.body;

    try {
        if (!req.usuario) {
            return res.status(401).json({ error: 'Usuário não autenticado' });
        }

        let abrigo_id: number | undefined;
        let lar_temporario_id: number | undefined;

        if (req.usuario.tipo_usuario === 'ABRIGO') {
            abrigo_id = req.usuario.id;
        } else if (req.usuario.tipo_usuario === 'ADOTANTE') {
            lar_temporario_id = req.usuario.id;
        } else {
            return res.status(403).json({ error: 'Tipo de usuário não autorizado a cadastrar animais' });
        }

        const novoAnimal = await prisma.animal.create({
            data: {
                nome: dados.nome,
                especie: dados.especie,
                raca: dados.raca,
                idade: dados.idade,
                porte: dados.porte,
                sexo: dados.sexo,
                descricao: dados.descricao,
                status: dados.status || 'DISPONÍVEL',
                abrigo_id,
                lar_temporario_id,
            },
        });

        return res.status(201).json(novoAnimal);
    }catch(error) {
        return res.status(500).json({error: "Erro ao cadastrar animal"});
    }
}