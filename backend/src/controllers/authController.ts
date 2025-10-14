import {Request, Response} from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import prisma from "../lib/client";

const JWT_SECRET = process.env.JWT_SECRET || 'senha-secreta';

export const login = async (req: Request, res: Response) => {
    const { email, senha } = req.body;

    try {
        if(!email || !senha) {
            return res.status(400).json({message: 'Informe o email e a senha'});
        }

        const usuario = await prisma.usuario.findUnique({ where: { email } });

        if (!usuario) {
            return res.status(401).json({ error: "Usuário não encontrado" });
        }

        const senhaValida = await bcrypt.compare(senha, usuario.senha_hash || "");

        if (!senhaValida) {
            return res.status(401).json({ error: "Senha inválida" });
        }

        const token = jwt.sign(
        {
            id: usuario.id,
            tipo_usuario: usuario.tipo_usuario,
        },
        JWT_SECRET,
        { expiresIn: "8h" });

        return res.json({ token });
    }catch(error){
        return res.status(500).json({ error: "Erro ao autenticar" });
    }
}