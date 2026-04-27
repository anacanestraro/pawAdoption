import prisma from "../../src/lib/client";
import bcrypt from "bcryptjs";

export async function seedAdotantes() {
  const senhaHash = await bcrypt.hash("admin123", 10);

  const adotantes = [
    {
      email: "ana.silva@email.com",
      nome: "Ana Silva",
      telefone: "(41) 99111-2233",
      cpf: "123.456.789-01",
      nascimento: new Date("1990-03-15"),
      lar_temporario: true,
      capacidade: 2,
      cep: "80250-060",
      logradouro: "Rua Marechal Floriano",
      numero: "54",
      bairro: "Água Verde",
      cidade: "Curitiba",
      estado: "PR",
    },
    {
      email: "carlos.mendes@email.com",
      nome: "Carlos Mendes",
      telefone: "(11) 97654-3210",
      cpf: "987.654.321-09",
      nascimento: new Date("1985-07-22"),
      lar_temporario: false,
      capacidade: null,
      cep: "01310-200",
      logradouro: "Rua Augusta",
      numero: "1200",
      bairro: "Consolação",
      cidade: "São Paulo",
      estado: "SP",
    },
    {
      email: "mariana.costa@email.com",
      nome: "Mariana Costa",
      telefone: "(51) 98899-7766",
      cpf: "456.789.123-00",
      nascimento: new Date("1995-11-08"),
      lar_temporario: true,
      capacidade: 1,
      cep: "90035-001",
      logradouro: "Avenida Ipiranga",
      numero: "890",
      bairro: "Azenha",
      cidade: "Porto Alegre",
      estado: "RS",
    },
  ];

  let count = 0;
  for (const a of adotantes) {
    const existing = await prisma.usuario.findUnique({ where: { email: a.email } });
    if (!existing) {
      await prisma.usuario.create({
        data: {
          email: a.email,
          senha_hash: senhaHash,
          nome: a.nome,
          telefone: a.telefone,
          tipo_usuario: "ADOTANTE",
          endereco: {
            create: {
              cep: a.cep,
              logradouro: a.logradouro,
              numero: a.numero,
              bairro: a.bairro,
              cidade: a.cidade,
              estado: a.estado,
            },
          },
          adotante: {
            create: {
              cpf: a.cpf,
              data_nascimento: a.nascimento,
              lar_temporario: a.lar_temporario,
              capacidade_lar_temporario: a.capacidade,
            },
          },
        },
      });
      count++;
    }
  }

  console.log(`  ✔ ${count} adotantes criados (${adotantes.length - count} já existiam)`);
}