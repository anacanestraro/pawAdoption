import {Request, Response} from "express";
import prisma from "../lib/client";
import { NovoAbrigoDTO } from "../dtos/AbrigoDTO";
import bcrypt from "bcryptjs";

export const listarAbrigos = async (req: Request, res: Response) => {
    try {
        const abrigos = await prisma.abrigo.findMany({
            where: {
                deleted_at: null,
                usuario: {ativo: true},
            },
            include: {usuario:true},
        });

        return res.status(200).json(abrigos);
    }catch(error) {
        return res.status(500).json({error: "Erro ao buscar abrigos"});
    }
}