import {Request, Response} from "express";
import prisma from "../lib/client";
import { NovoAdministradorDTO } from "../dtos/AdministradorDTO";
import bcrypt from "bcryptjs";

export const listarAdministradores = async(req: Request, res: Response) => {
    try {
        const administradores = await prisma.administradores.findMany({
            where: {
                deleted_at: null,
                usuario: {ativo: true}
            },
            include: {usuario:true},
        });
        return res.status(200).json(administradores);
    }catch(error){
        return res.status(500).json({error:"Erro ao buscar administradores"});
    }
}
