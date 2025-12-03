import prisma from "../../src/lib/client"
import bcrypt from "bcryptjs";

async function main() {
    console.log("🌱 Iniciando seeder...");

    const senhaHash = await bcrypt.hash("admin123", 10);

    
    const admin = await prisma.usuario.upsert({
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
                    departamento: "Desenvolvedor"
                }
            }
        }
    });

    console.log("✔ Admin criado:", admin.email);
    console.log("✔ Seed Finalizado")
}

main().catch((e) => {
    console.error(e);
});