import prisma from "../../src/lib/client";
import bcrypt from "bcryptjs";

export async function seedAdotante() {

    const senhaHash = await bcrypt.hash("admin123", 10);

    const adotante = await prisma.usuario.upsert({
        where: {email: "adotante@seeder.com"},
        update:{},
        create: {
            email: "adotante@seeder.com",
            senha_hash: senhaHash,
            nome: "Adotante",
            telefone: "000000000",
            tipo_usuario:"ADOTANTE",

            adotante: {
                create:{
                    cpf: "11111111111",
                    data_nascimento: new Date ("2011-11-11"),
                    lar_temporario: true,
                    capacidade_lar_temporario: 1
                }
            }
        }
    });
}

seedAdotante().catch((e) => {
    console.error(e);
});