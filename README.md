# 🚀 Project Name

A scalable backend application built with **NestJS**, **GraphQL**, and **Prisma**.

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** v18.x+
- **npm** or **Yarn**
- **PostgreSQL** (or your DB of choice)
- **NestJS CLI** (optional but recommended)

```bash
npm i -g @nestjs/cli
```

---

## ⚙️ Environment Setup

1. **Clone the repository**

```bash
git clone https://github.com/your-username/project-name.git
cd project-name
```

2. **Install dependencies**

```bash
npm install
# or
yarn install
```

3. **Set up environment variables**

Create a `.env` file at the root of the project with the following:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/db_name
PORT=3000
NODE_ENV=development
```

> You can copy the template file using:  
> `cp .env.example .env`

4. **Generate Prisma client**

```bash
npx prisma generate
```

5. **Run database migrations**

```bash
npx prisma migrate dev
```

---

## 🧪 Running Tests

This project uses **Jest** for unit and integration testing.

```bash
npm run test
# or
yarn test
```

To run with coverage:

```bash
npm run test:cov
```

---

## 🚀 Running the App

```bash
npm run start:dev
```

> This starts the app in watch mode (Hot Reload via `ts-node-dev`).

---

## 🧰 Available Scripts

| Command | Description |
|--------|-------------|
| `start:dev` | Run app in dev mode |
| `start:prod` | Run app in production mode |
| `test` | Run unit tests |
| `test:cov` | Run tests with coverage |
| `prisma generate` | Regenerate Prisma client |
| `prisma migrate dev` | Run dev DB migrations |

---

## 📂 Project Structure

```bash
src/
├── modules/         # Feature modules
├── common/          # Shared utilities, guards, interceptors
├── prisma/          # PrismaService & DB config
├── main.ts          # Entry point
└── app.module.ts    # Root module
```

---

## 💬 GraphQL Playground

Once the app is running, access the interactive GraphQL playground at:

```
http://localhost:3000/graphql
```

---

## 🧱 Tech Stack

- [NestJS](https://nestjs.com/)
- [GraphQL](https://graphql.org/)
- [Prisma ORM](https://www.prisma.io/)
- [Jest](https://jestjs.io/)
- [PostgreSQL](https://www.postgresql.org/)

---

## 🙌 Contributing

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/thing`)
3. Commit your changes (`git commit -m 'feat: add thing'`)
