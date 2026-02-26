import express from 'express';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import usuarioRotas from "./routes/UsuarioRoute";
import adotanteRotas from "./routes/AdotanteRoute";
import abrigoRotas from "./routes/AbrigoRoute";
import administradoresRotas from "./routes/AdministradorRoute";
import animaisRotas from "./routes/AnimalRoute";
import authRotas from "./routes/AuthRouter";
import ValidacaoRotas from "./routes/ValidacaoRoute";
import SolicitacaoRotas from "./routes/SolicitacaoRoute";

dotenv.config();

const app = express();
const prisma = new PrismaClient();

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World');
});

// Exemplo de rota usando Prisma
app.get('/users', async (req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
});

app.use("/administradores", administradoresRotas);
app.use("/abrigos", abrigoRotas);
app.use("/adotantes", adotanteRotas);
app.use("/usuarios", usuarioRotas);
app.use("/animais", animaisRotas);
app.use("/auth", authRotas);
app.use("/validacoes", ValidacaoRotas);
app.use("/solicitacoes", SolicitacaoRotas)

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
