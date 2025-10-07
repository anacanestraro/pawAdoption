import express from 'express';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import usuarioRotas from "./routes/UsuarioRoute";
import adotanteRotas from "./routes/AdotanteRoute";
import abrigoRotas from "./routes/AbrigoRoute";

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

app.use("/abrigos", abrigoRotas);
app.use("/adotantes", adotanteRotas);
app.use("/usuarios", usuarioRotas);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
