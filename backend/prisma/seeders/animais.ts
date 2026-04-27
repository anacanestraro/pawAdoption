import prisma from "../../src/lib/client";

export async function seedAnimais() {
  // Busca os abrigos pelo CNPJ — mais robusto que buscar por email
  const [a1, a2, a3] = await Promise.all([
    prisma.abrigo.findUnique({ where: { cnpj: "12.345.678/0001-90" } }),
    prisma.abrigo.findUnique({ where: { cnpj: "98.765.432/0001-12" } }),
    prisma.abrigo.findUnique({ where: { cnpj: "55.444.333/0001-22" } }),
  ]);

  if (!a1 || !a2 || !a3) {
    throw new Error(
      `Abrigos não encontrados no banco. Faltando: ${!a1 ? "Focinhos " : ""}${!a2 ? "Patas " : ""}${!a3 ? "CasaBichos" : ""}`.trim()
    );
  }

  // usuario_id = ID do usuário dono do abrigo
  const u1 = { id: a1.usuario_id };
  const u2 = { id: a2.usuario_id };
  const u3 = { id: a3.usuario_id };

  const animais = [
    // ── Lar dos Focinhos ──────────────────────────────
    {
      nome: "Lexie",
      especie: "Cachorro",
      raca: "Border Collie SRD",
      idade: 2,
      porte: "MEDIO" as const,
      sexo: "FEMEA" as const,
      descricao:
        "Lexie é uma cachorrinha energética e inteligente. Adora correr no parque e aprender truques novos. Ótima com crianças e outros cães.",
      status: "DISPONIVEL" as const,
      abrigo_id: u1.id,
    },
    {
      nome: "Bolinha",
      especie: "Cachorro",
      raca: "Vira-lata",
      idade: 5,
      porte: "PEQUENO" as const,
      sexo: "MACHO" as const,
      descricao:
        "Bolinha é um velhinho tranquilo que adora uma boa soneca. Perfeito para quem quer um companheiro calmo e carinhoso.",
      status: "DISPONIVEL" as const,
      abrigo_id: u1.id,
    },
    {
      nome: "Mel",
      especie: "Gato",
      raca: "Persa SRD",
      idade: 3,
      porte: "PEQUENO" as const,
      sexo: "FEMEA" as const,
      descricao:
        "Mel é uma gatinha meiga que adora colo. Muito tranquila, ideal para apartamentos. Já vacinada e castrada.",
      status: "DISPONIVEL" as const,
      abrigo_id: u1.id,
    },

    // ── Patas Felizes ────────────────────────────────
    {
      nome: "Bucky",
      especie: "Gato",
      raca: "Malhado",
      idade: 3,
      porte: "MEDIO" as const,
      sexo: "MACHO" as const,
      descricao:
        "Bucky é um gato que adora ficar no colo e ronronar. Muito sociável com humanos, mas prefere ser filho único.",
      status: "DISPONIVEL" as const,
      abrigo_id: u2.id,
    },
    {
      nome: "Thor",
      especie: "Cachorro",
      raca: "Labrador SRD",
      idade: 4,
      porte: "GRANDE" as const,
      sexo: "MACHO" as const,
      descricao:
        "Thor é um gigante gentil! Ama nadar, passear e brincar. Muito dócil com crianças. Precisa de espaço para se exercitar.",
      status: "DISPONIVEL" as const,
      abrigo_id: u2.id,
    },
    {
      nome: "Luna",
      especie: "Cachorro",
      raca: "SRD",
      idade: 1,
      porte: "MEDIO" as const,
      sexo: "FEMEA" as const,
      descricao:
        "Luna chegou filhotinha e cresceu no abrigo. Super dócil, já sabe sentar e dar a patinha. Espera por uma família para chamar de sua.",
      status: "DISPONIVEL" as const,
      abrigo_id: u2.id,
    },

    // ── Casa dos Bichos ──────────────────────────────
    {
      nome: "Chewie",
      especie: "Cachorro",
      raca: "Cocker Spaniel",
      idade: 5,
      porte: "MEDIO" as const,
      sexo: "MACHO" as const,
      descricao:
        "Chewie é calmo e companheiro. Gosta de passeios curtos e sestas longas. Ótimo para quem trabalha em casa.",
      status: "DISPONIVEL" as const,
      abrigo_id: u3.id,
    },
    {
      nome: "Mochi",
      especie: "Gato",
      raca: "Siamês SRD",
      idade: 1,
      porte: "PEQUENO" as const,
      sexo: "FEMEA" as const,
      descricao:
        "Mochi é curiosa e aventureira! Adora explorar cada cantinho da casa e brincar com bolinhas. Muita energia e amor para dar.",
      status: "DISPONIVEL" as const,
      abrigo_id: u3.id,
    },
    {
      nome: "Pingo",
      especie: "Cachorro",
      raca: "Dachshund SRD",
      idade: 7,
      porte: "PEQUENO" as const,
      sexo: "MACHO" as const,
      descricao:
        "Pingo é um senhor digno que merece uma aposentadoria confortável. Adora coberta, sol e petiscos. Não precisa de muito, só de amor.",
      status: "DISPONIVEL" as const,
      abrigo_id: u3.id,
    },
  ];

  let count = 0;
  for (const dados of animais) {
    // Usa upsert via nome + abrigo_id para não duplicar em re-runs
    const existing = await prisma.animal.findFirst({
      where: { nome: dados.nome, abrigo_id: dados.abrigo_id, deleted_at: null },
    });

    if (!existing) {
      await prisma.animal.create({ data: dados });
      count++;
    }
  }

  console.log(`  ✔ ${count} animais criados (${animais.length - count} já existiam)`);
}