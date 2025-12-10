import { seedAdotante } from "./seeders/adotante";
import { seedAdm } from "./seeders/admin";
import { seedAbrigo } from "./seeders/abrigo";

async function main() {
    console.log("🌱 Iniciando seeds...")

    await seedAdm();
    await seedAdotante();
    await seedAbrigo();

    console.log("✔ Seeds finalizados!");
}

main().catch((e) => {
    console.error(e);
});