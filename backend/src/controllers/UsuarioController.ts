import {Request, Response} from "express";
import prisma from "../lib/client";

export const listarUsuarios = async (req: Request, res: Response) => {
    try {
        const usuarios = await prisma.usuario.findMany({
            where: {
            deleted_at: null,
            usuario: { ativo: true },
            },
            include: { usuario: true },
        });
        return res.status(200).json(usuarios);
    }catch (error){
        return res.status(500).json({error: "Erro ao buscar usuários"});
    }
}

export const listarUsuarioPorId = async (req: Request, res: Response) => {
    try {
        const {id} = req.params;
        const usuario = await prisma.usuario.findUnique({
            where: {id: Number(id)},
            include: {endereco:true},
        });

        if(!usuario){
            return res.status(404).json({error: "Usuário não encontrado"});
        }
        return res.json(usuario);
    }catch(error) {
        return res.status(500).json({error:"Erro ao buscar usuário"});
    }
}