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