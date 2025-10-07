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

export const cadastrarAbrigo = async(req: Request, res: Response) =>  {
    const dados: NovoAbrigoDTO = req.body;

    try {
        const  senhaHash = await bcrypt.hash(dados.senha, 10);

        const result = await prisma.$transaction(async (tx) =>{
            const usuario = await tx.usuario.create({
                data: {
                    email: dados.email,
                    senha_hash: senhaHash,
                    nome: dados.nome,
                    telefone: dados.telefone,
                    tipo_usuario: "ABRIGO",
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

            const abrigo = await tx.abrigo.create({
                data: {
                    usuario_id: usuario.id,
                    cnpj: dados.cnpj,
                    razao_social: dados.razao_social,
                    capacidade: dados.capacidade,
                    sobre: dados.sobre,
                    site_url: dados.site_url,
                    redes_sociais: dados.redes_sociais,
                },
                include: {
                    usuario: {
                        include: {
                            endereco: true,
                        },
                    },
                },
            });
            return abrigo;
        });

        return res.status(201).json(result);
    }catch(error){
        return res.status(500).json({error: "Erro ao cadastrar abrigo"});
    }
}