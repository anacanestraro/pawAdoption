# 🐾 PawAdoption

Plataforma de adoção de animais que conecta abrigos, adotantes e lares temporários.

---

## Tecnologias

- **Backend:** Node.js + TypeScript + Express
- **ORM:** Prisma
- **Banco de dados:** MySQL 8
- **Containerização:** Docker + Docker Compose

---

## Pré-requisitos

- [Docker](https://www.docker.com/) instalado
- [Docker Compose](https://docs.docker.com/compose/) instalado

---

## Como subir o projeto

### 1. Clone o repositório

```bash
git clone https://github.com/anacanestraro/pawAdoption.git
cd pawAdoption
```

### 2. Configure as variáveis de ambiente

Crie um arquivo `.env` dentro da pasta `backend/`:

```env
DATABASE_URL="mysql://root:root@db:3306/pawadoption"
JWT_SECRET="seu_secret_aqui"
PORT=5000
MYSQL_ROOT_PASSWORD=root
MYSQL_DATABASE=pawadoption
```

### 3. Suba os containers

```bash
docker compose up --build
```

Isso irá subir:
- `dev-backend` — API rodando na porta `5000`
- `dev-frontend` — Frontend rodando na porta `5173`
- `dev-db` — Banco de dados MySQL na porta `3306`
- `prisma-studio` — Interface visual do banco na porta `5555`

### 4. Rode as migrations

Em outro terminal, com os containers já rodando:

```bash
docker compose exec backend npx prisma migrate dev
```

### 5. Acesse

| Serviço | URL |
|---|---|
| API | http://localhost:5000 |
| Frontend | http://localhost:5173 |
| Prisma Studio | http://localhost:5555 |

---

## Comandos úteis

```bash
# Parar os containers
docker compose down

# Rebuildar sem cache
docker compose build --no-cache

# Ver logs do backend
docker compose logs -f backend

# Acessar o container do backend
docker compose exec backend sh

# Rodar migrations
docker compose exec backend npx prisma migrate dev

# Gerar Prisma Client
docker compose exec backend npx prisma generate
```

---

## Estrutura do projeto

```
pawAdoption/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma
│   ├── src/
│   │   ├── controllers/
│   │   ├── dtos/
│   │   ├── middlewares/
│   │   ├── routes/
│   │   └── index.ts
│   ├── Dockerfile
│   └── package.json
├── frontend/
├── docker-compose.yml
└── README.md
```
