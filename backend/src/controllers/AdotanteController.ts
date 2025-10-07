import {Request, Response} from "express";
import prisma from "../lib/client";
import { NovoAdotanteDTO } from "../dtos/AdotanteDTO";
import bcrypt from "bcryptjs";

export const listarAdotantes = async (req: Request, res: Response) => {
    try {
        const adotantes = await prisma.adotante.findMany({
          where: {
          deleted_at: null,
          usuario: { ativo: true },
          },
          include: { usuario: true },
        });
        return res.status(200).json(adotantes);
    }catch(error){
        return res.status(500).json({error:"Erro ao buscar adotantes"});
    }
}

export async function cadastrarAdotante(req: Request, res: Response) {
  const dados: NovoAdotanteDTO = req.body; // pega os dados do corpo da requisição

  try {
    const senhaHash = await bcrypt.hash(dados.senha, 10);

    const result = await prisma.$transaction(async (tx) => {
      const usuario = await tx.usuario.create({
        data: {
          email: dados.email,
          senha_hash: senhaHash,
          nome: dados.nome,
          telefone: dados.telefone,
          tipo_usuario: "ADOTANTE",
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

      const adotante = await tx.adotante.create({
        data: {
          usuario_id: usuario.id,
          cpf: dados.cpf,
          data_nascimento: dados.data_nascimento,
          lar_temporario: dados.lar_temporario ?? false,
          capacidade_lar_temporario: dados.capacidade_lar_temporario,
        },
        include: {
          usuario: {
            include: {
              endereco: true,
            },
          },
        },
      });

      return adotante;
    });

    return res.status(201).json(result);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao cadastrar adotante" });
  }
}

export const atualizarAdotante = async (req: Request, res: Response) => {
  const { id } = req.params;
  const dados: Partial<NovoAdotanteDTO> = req.body;

  try {
    const adotanteExistente = await prisma.adotante.findUnique({
      where: { usuario_id: Number(id) },
      include: { usuario: { include: { endereco: true } } },
    });

    if (!adotanteExistente) {
      return res.status(404).json({ error: "Adotante não encontrado" });
    }

    const result = await prisma.$transaction(async (tx) => {
      const usuarioAtualizado = await tx.usuario.update({
        where: { id: Number(id) },
        data: {
          nome: dados.nome ?? adotanteExistente.usuario.nome,
          email: dados.email ?? adotanteExistente.usuario.email,
          telefone: dados.telefone ?? adotanteExistente.usuario.telefone,
          senha_hash: dados.senha
            ? await bcrypt.hash(dados.senha, 10)
            : adotanteExistente.usuario.senha_hash,
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

      const adotanteAtualizado = await tx.adotante.update({
        where: { usuario_id: Number(id) },
        data: {
          cpf: dados.cpf ?? adotanteExistente.cpf,
          data_nascimento: dados.data_nascimento ?? adotanteExistente.data_nascimento,
          lar_temporario: dados.lar_temporario ?? adotanteExistente.lar_temporario,
          capacidade_lar_temporario:
            dados.capacidade_lar_temporario ?? adotanteExistente.capacidade_lar_temporario,
        },
        include: {
          usuario: { include: { endereco: true } },
        },
      });

      return adotanteAtualizado;
    });

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao atualizar adotante" });
  }
};

export const deletarAdotante = async (req: Request, res: Response) => {
  const { id } = req.params; // id = usuario_id

  try {
    const adotante = await prisma.adotante.findUnique({
      where: { usuario_id: Number(id) },
      include: { usuario: true },
    });

    if (!adotante) {
      return res.status(404).json({ error: "Adotante não encontrado" });
    }

    await prisma.$transaction([
      prisma.adotante.update({
        where: { usuario_id: Number(id) },
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

    return res.status(200).json({ message: "Adotante desativado com sucesso." });
  } catch (error) {
    return res.status(500).json({ error: "Erro ao desativar adotante." });
  }
};