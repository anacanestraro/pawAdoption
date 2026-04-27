import prisma from "../../src/lib/client";
import bcrypt from "bcryptjs";

export async function seedAdm() {
  const senhaHash = await bcrypt.hash("admin123", 10);

  await prisma.usuario.upsert({
    where: { email: "admin@seeder.com" },
    update: {},
    create: {
      email: "admin@seeder.com",
      senha_hash: senhaHash,
      nome: "Administrador",
      telefone: "000000000",
      tipo_usuario: "ADMINISTRADOR",
      ativo: true,
      administrador: {
        create: {
          nivel_acesso: 1,
          departamento: "Desenvolvedor",
        },
      },
    },
  });

  console.log("  ✔ Admin criado: admin@seeder.com / admin123");
}
