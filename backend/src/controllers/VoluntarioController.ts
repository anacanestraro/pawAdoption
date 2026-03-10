import { Request, Response } from "express";
import prisma from "../lib/client";
import { AuthRequest } from "../middlewares/auth";
import { NovoVoluntarioDto, AtualizarVoluntarioDTO } from "../dtos/VoluntarioDTO";

export const listarVoluntariosDoAbrigo = async (req: Request, res: Response) => {
    try {

        const { abrigo_id } = req.params;
        const voluntarios = await prisma.voluntario.findMany({
            where: {
                abrigo_id: Number(abrigo_id),
                status: 'ATIVO'
            },
            include: {
                adotante: true,
            }
        });
        return res.status(200).json(voluntarios);
    } catch (error) {
        return res.status(500).json({ error: "Erro ao buscar voluntários do abrigo" });
    }
}