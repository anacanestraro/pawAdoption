import { seedAdotante } from "./seeders/adotante";
import { seedAdm } from "./seeders/admin";

async function main() {
    console.log("🌱 Iniciando seeds...")

    await seedAdm();
    await seedAdotante();

    console.log("✔ Seeds finalizados!");
}

main().catch((e) => {
    console.error(e);
});