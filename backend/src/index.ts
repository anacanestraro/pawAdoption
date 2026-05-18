import express from 'express';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';
import usuarioRotas from "./routes/UsuarioRoute";
import adotanteRotas from "./routes/AdotanteRoute";
import abrigoRotas from "./routes/AbrigoRoute";
import administradoresRotas from "./routes/AdministradorRoute";
import animaisRotas from "./routes/AnimalRoute";
import authRotas from "./routes/AuthRouter";
import ValidacaoRotas from "./routes/ValidacaoRoute";
import SolicitacaoRotas from "./routes/SolicitacaoRoute";
import denunciaRotas from "./routes/DenunciaRoute";
import voluntarioRotas from "./routes/VoluntarioRoute";
import cors from 'cors';

dotenv.config();

const app = express();
const prisma = new PrismaClient();

app.use(express.json());

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));

// ── Serve arquivos de upload estáticos ───────────────────────────────────────
// url_foto salva no banco: /uploads/animais/arquivo.jpg
// acesso via:              http://localhost:3001/uploads/animais/arquivo.jpg
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', (req, res) => {
  res.send('Hello World');
});

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
app.use("/solicitacoes", SolicitacaoRotas);
app.use("/denuncias", denunciaRotas);
app.use("/voluntarios", voluntarioRotas);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});