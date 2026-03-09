import { Request, Response } from "express";
import prisma from "../lib/client";
import { AuthRequest } from "../middlewares/auth";
import { NovoVoluntarioDto, AtualizarVoluntarioDTO } from "../dtos/VoluntarioDTO";

export const listarVoluntarios = async (req: Request, res: Response) => {
    try {
        const voluntarios = await prisma.voluntario.findMany({
            include: {
                adotante: true,
                abrigo: true,
            }
        });
        return res.status(200).json(voluntarios);
    } catch (error) {
        return res.status(500).json({ error: "Erro ao buscar voluntários" });
    }
}