import express from 'express';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import usuarioRotas from "./routes/UsuarioRoute.js";
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
app.use(usuarioRotas);
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
//# sourceMappingURL=index.js.map