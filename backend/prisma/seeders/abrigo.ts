import prisma from "../../src/lib/client";
import bcrypt from "bcryptjs";

export async function seedAbrigo() {
    const senhaHash = await bcrypt.hash("admin123", 10);

    const abrigo = await prisma.usuario.upsert({
        where: {email: "abrigo@seeder.com"},
        update:{},
        create: {
            email: "abrigo@seeder.com",
            senha_hash: senhaHash,
            nome: "Abrigo",
            telefone: "000000000",
            tipo_usuario:"ABRIGO",

            abrigo: {
                create:{
                    cnpj: "12345678912",
                    razao_social: "Abrigo",
                    capacidade: 50,
                }
            }
        }
    });
}

seedAbrigo().catch((e) => {
    console.error(e);
})