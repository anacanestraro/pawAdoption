import { Request, Response } from "express";
import prisma from "../lib/client";
import { AuthRequest } from "../middlewares/auth";
import { NovaDenunciaDTO, AtualizarDenunciaDTO } from "../dtos/DenunciaDTO";

export const listarDenuncias = async (req: Request, res:Response) => {
    try {
        const denuncias = await prisma.denuncia.findMany({
            include: {
                animal: true,
                usuario_denunciante: true,
            }
        });
        return res.status(200).json(denuncias);
    } catch(error) {
        return res.status(500).json({ error: "Erro ao buscar denuncias"});
    }
}