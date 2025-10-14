import {Request, Response} from "express";
import prisma from "../lib/client";
import { NovoAnimalDTO } from "../dtos/AnimalDTO";

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