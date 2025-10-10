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
                },
            });

            if(dados.endereco) {
                await tx.endereco.create({
                    data: {
                        cep: dados.endereco.cep,
                        logradouro: dados.endereco.logradouro,
                        numero: dados.endereco.numero,
                        complemento: dados.endereco.complemento,
                        bairro: dados.endereco.bairro,
                        cidade: dados.endereco.cidade,
                        estado: dados.endereco.estado,
                        usuario_id: usuario.id
                    }
                });
            }
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

export async function atualizarAdministrador(req: Request, res: Response) {
    const {id} = req.params;
    const dados: Partial<NovoAdministradorDTO> = req.body;

    try {
        const administradorExistente = await prisma.administrador.findUnique({
            where: {usuario_id: Number(id)},
            include: { usuario: { include: { endereco:true } } },
        });

        if (!administradorExistente) {
            return res.status(404).json({error: "Administrador não encontrado"});
        }

        const result = await prisma.$transaction(async(tx) => {
            const usuarioAtualizado = await tx.usuario.update({
                where: { id: Number(id) },
                data: {
                nome: dados.nome ?? administradorExistente.usuario.nome,
                email: dados.email ?? administradorExistente.usuario.email,
                telefone: dados.telefone ?? administradorExistente.usuario.telefone,
                senha_hash: dados.senha
                    ? await bcrypt.hash(dados.senha, 10)
                    : administradorExistente.usuario.senha_hash,
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

            const administradorAtualizado = await tx.administrador.update({
                where: {usuario_id: Number(id)},
                data: {
                    nivel_acesso:dados.nivel_acesso ?? administradorExistente.nivel_acesso,
                    departamento: dados.departamento ?? administradorExistente.departamento,
                },
                include: {
                    usuario: {include: { endereco: true}},
                },
            });
            return administradorAtualizado;
        });
        return res.status(200).json(result);
    }catch(error) {
        return res.status(500).json({error: "Erro ao atualizar administrador"})
    }
}

export const deletarAdministrador = async(req: Request, res:Response) => {
    const { id } = req.params;

    try {
        const administrador = await prisma.administrador.findUnique({
            where: {usuario_id: Number(id)},
            include: {usuario:true},
        });

        if(!administrador) {
            return res.status(404).json({error: "Administrador não encontrado"});
        }

        await prisma.$transaction([
            prisma.administrador.update({
                where: {usuario_id: Number(id)},
                data: { deleted_at: new Date() },
            }),
            prisma.usuario.update({
                where: { id: Number(id) },
                data: {
                    ativo: false,
                    deleted_at: new Date(),
                },
      }),
        ]);

        return res.status(200).json({message:"Administrador desativado com sucesso"});
    }catch(error) {
        return res.status(500).json({error: "Erro ao desativar administrador"});
    }
}