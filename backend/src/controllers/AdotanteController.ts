import {Request, Response} from "express";
import prisma from "../lib/client";
import { NovoAdotanteDTO } from "../dtos/AdotanteDTO";
import bcrypt from "bcryptjs";

export const listarAdotantes = async (req: Request, res: Response) => {
    try {
        const adotantes = await prisma.adotante.findMany();
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