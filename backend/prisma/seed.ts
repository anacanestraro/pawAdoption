import { seedAdm } from "./seeders/admin";
import { seedAbrigos } from "./seeders/abrigos";
import { seedAdotantes } from "./seeders/adotantes";
import { seedAnimais } from "./seeders/animais";

async function main() {
  console.log("\n🌱 Iniciando seeds...\n");

  console.log("👤 Admins...");
  await seedAdm();

  console.log("🏠 Abrigos...");
  await seedAbrigos();

  console.log("🐾 Animais...");
  await seedAnimais(); // depende dos abrigos, sempre depois

  console.log("👥 Adotantes...");
  await seedAdotantes();

  console.log("\n✅ Seeds finalizados!\n");
  console.log("Credenciais para teste:");
  console.log("─────────────────────────────────────────");
  console.log("ABRIGOS (senha: admin123)");
  console.log("  focinhos@pawadoption.com");
  console.log("  patas@pawadoption.com");
  console.log("  casabichos@pawadoption.com");
  console.log("─────────────────────────────────────────");
  console.log("ADOTANTES (senha: admin123)");
  console.log("  ana.silva@email.com");
  console.log("  carlos.mendes@email.com");
  console.log("  mariana.costa@email.com");
  console.log("─────────────────────────────────────────");
}

main().catch((e) => {
  console.error("❌ Erro nos seeds:", e);
  process.exit(1);
});