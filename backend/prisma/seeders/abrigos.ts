import prisma from "../../src/lib/client";
import bcrypt from "bcryptjs";

export async function seedAbrigos() {
  const senhaHash = await bcrypt.hash("admin123", 10);

  const abrigos = [
    {
      email: "focinhos@pawadoption.com",
      nome: "Lar dos Focinhos",
      telefone: "(41) 99801-1234",
      cnpj: "12.345.678/0001-90",
      razao_social: "Lar dos Focinhos Associação Animal LTDA",
      capacidade: 180,
      sobre: "Um abrigo comunitário em Curitiba cuidando de cães de rua desde 2014. Focamos em pets idosos e animais em recuperação, com uma ala médica dedicada e 14 voluntários.",
      site_url: "lardosfocinhos.org.br",
      redes_sociais: JSON.stringify({ instagram: "@lardosfocinhos", facebook: "lardosfocinhos" }),
      endereco: { cep: "80010-010", logradouro: "Rua XV de Novembro", numero: "342", bairro: "Centro", cidade: "Curitiba", estado: "PR" },
    },
    {
      email: "patas@pawadoption.com",
      nome: "Patas Felizes",
      telefone: "(11) 98765-4321",
      cnpj: "98.765.432/0001-12",
      razao_social: "Patas Felizes Resgate e Adoção S/A",
      capacidade: 400,
      sobre: "A maior rede de abrigos no-kill do Brasil. Já colocamos mais de 12 mil animais desde 2009 e operamos 4 unidades em São Paulo com serviços veterinários completos.",
      site_url: "patasfelizes.com.br",
      redes_sociais: JSON.stringify({ instagram: "@patasfelizes", facebook: "patasfelizes" }),
      endereco: { cep: "01310-100", logradouro: "Avenida Paulista", numero: "1578", bairro: "Bela Vista", cidade: "São Paulo", estado: "SP" },
    },
    {
      email: "casabichos@pawadoption.com",
      nome: "Casa dos Bichos",
      telefone: "(51) 99234-5678",
      cnpj: "55.444.333/0001-22",
      razao_social: "Casa dos Bichos ONG",
      capacidade: 120,
      sobre: "Um abrigo jovem e energético em Porto Alegre tocado por universitários e aposentados. Cada animal passa por uma família temporária antes da adoção definitiva.",
      site_url: "casadosbichos.com",
      redes_sociais: JSON.stringify({ instagram: "@casadosbichos" }),
      endereco: { cep: "90010-280", logradouro: "Rua dos Andradas", numero: "890", bairro: "Centro Histórico", cidade: "Porto Alegre", estado: "RS" },
    },
  ];

  let count = 0;
  for (const dados of abrigos) {
    // Checa se o CNPJ já existe — evita unique constraint error
    const cnpjExistente = await prisma.abrigo.findUnique({
      where: { cnpj: dados.cnpj },
    });
    if (cnpjExistente) {
      console.log(`  ⏭  Abrigo já existe (CNPJ ${dados.cnpj}), pulando...`);
      continue;
    }

    // Checa se o email já existe
    const emailExistente = await prisma.usuario.findUnique({
      where: { email: dados.email },
    });
    if (emailExistente) {
      console.log(`  ⏭  Usuário já existe (${dados.email}), pulando...`);
      continue;
    }

    await prisma.usuario.create({
      data: {
        email: dados.email,
        senha_hash: senhaHash,
        nome: dados.nome,
        telefone: dados.telefone,
        tipo_usuario: "ABRIGO",
        endereco: { create: dados.endereco },
        abrigo: {
          create: {
            cnpj: dados.cnpj,
            razao_social: dados.razao_social,
            capacidade: dados.capacidade,
            sobre: dados.sobre,
            site_url: dados.site_url,
            redes_sociais: dados.redes_sociais,
          },
        },
      },
    });
    count++;
  }

  console.log(`  ✔ ${count} abrigo(s) criado(s)`);
}