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

export const atualizarAbrigo = async (req: Request, res: Response) => {
    const {id} = req.params;
    const dados: Partial<NovoAbrigoDTO> = req.body;

    try {
        const abrigoExistente = await prisma.abrigo.findUnique({
            where: {usuario_id: Number(id)},
            include: {usuario: {include: {endereco: true}}},
        });

        if(!abrigoExistente) {
            return res.status(404).json({error: "Abrigo não encontrado"});
        }

        const result = await prisma.$transaction(async (tx) => {
            const usuarioAtualizado = await tx.usuario.update({
                where: {id: Number(id)},
                data: {
                    nome: dados.nome ?? abrigoExistente.usuario.nome,
                    email:dados.email ?? abrigoExistente.usuario.email,
                    telefone: dados.telefone ?? abrigoExistente.usuario.telefone,
                    senha_hash: dados.senha
                    ? await bcrypt.hash(dados.senha, 10)
                    : abrigoExistente.usuario.senha_hash,
                    endereco: dados.endereco
                    ? {
                        upsert: {
                        create: {
                            cep: dados.endereco.cep,
                            logradouro: dados.endereco.logradouro,
                            numero: dados.endereco.numero,
                            complemento: dados.endereco.complemento,
                            bairro: dados.endereco.bairro,
                            cidade: dados.endereco.cidade,
                            estado: dados.endereco.estado,
                        },
                        update: {
                            cep: dados.endereco.cep,
                            logradouro: dados.endereco.logradouro,
                            numero: dados.endereco.numero,
                            complemento: dados.endereco.complemento,
                            bairro: dados.endereco.bairro,
                            cidade: dados.endereco.cidade,
                            estado: dados.endereco.estado,
                        },
                        },
                    }
                    : undefined,
                },
            });

            const abrigoAtualizado = await tx.abrigo.update ({
                where: {usuario_id: Number(id)},
                data: {
                    cnpj: dados.cnpj ?? abrigoExistente.cnpj,
                    razao_social: dados.razao_social ?? abrigoExistente.razao_social,
                    capacidade: dados.capacidade ?? abrigoExistente.capacidade,
                    sobre: dados.sobre ?? abrigoExistente.sobre,
                    site_url: dados.site_url ?? abrigoExistente.site_url,
                    redes_sociais: dados.redes_sociais ?? abrigoExistente.redes_sociais,
                },
                include : {
                    usuario: {include:{endereco: true}},
                }
            });
            return abrigoAtualizado;
        });

        return res.status(200).json(result);
    }catch(error) {
        return res.status(500).json({error: "Erro ao atualizar abrigo"})
    }
}

export const deletarAbrigo = async (req: Request, res: Response) => {
    const {id} = req.params;

    try {
        const abrigo = await prisma.abrigo.findUnique({
            where: {usuario_id: Number(id)},
            include: {usuario:true},
        });

        if(!abrigo) {
            return res.status(404).json({error: "Abrigo não encontrado"});
        }

        await prisma.$transaction([
            prisma.abrigo.update({
                where: {usuario_id: Number(id)},
                data:{deleted_at: new Date()},
            }),
            prisma.usuario.update({
                where: { id: Number(id) },
                data: {
                    ativo: false,
                    deleted_at: new Date(),
                },
            }),
        ]);

        return res.status(200).json({message: "Abrigo desativado com sucesso"});
    }catch(error){
        return res.status(500).json({error: "Erro ao desativar abrigo"});
    }
}