import {Request, Response} from "express";
import prisma from "../lib/client";
import { NovoAdministradorDTO } from "../dtos/AdministradorDTO";
import bcrypt from "bcryptjs";

export const listarAdministradores = async(req: Request, res: Response) => {
    try {
        const administradores = await prisma.administrador.findMany({
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

export async function cadastrarAdministrador (req: Request, res: Response) {
    const dados: NovoAdministradorDTO = req.body;
    
    try {
        const senhaHash = await bcrypt.hash(dados.senha, 10);

        const result = await prisma.$transaction(async(tx) => {
            const usuario = await tx.usuario.create({
                data: {
                    email: dados.email,
                    senha_hash: senhaHash,
                    nome: dados.nome,
                    telefone: dados.telefone,
                    tipo_usuario: "ADMINISTRADOR",
                    endereco: dados.endereco
                        ? {
                            create: {
                                cep: dados.endereco.cep,
                                logradouro: dados.endereco.logradouro,
                                numero: dados.endereco.numero,
                                complemento: dados.endereco.complemento,
                                bairro: dados.endereco.bairro,
                                cidade: dados.endereco.cidade,
                                estado: dados.endereco.estado,
                            },
                        }
                    : undefined,
                },
            });

            const administrador = await tx.administrador.create({
                data: {
                    usuario_id: usuario.id,
                    nivel_acesso: dados.nivel_acesso ?? 1,
                    departamento: dados.departamento,
                },
                include: {
                    usuario: {
                        include: {
                            endereco: true,
                        },
                    },
                },
            });

            return administrador;
        });

        return res.status(201).json(result);
    }catch(error) {
        return res.status(500).json({error: "Erro ao cadastrar administrador"})
    }
}
