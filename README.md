# Carteira financeira — Grupo Adriano Cobuccio

Desafio técnico: monorepo com **Next.js** (`apps/web`), **Nest.js** (`apps/api`) e **TypeScript**. A forma principal de rodar o ambiente é o **Docker Compose**.

## Stack

- Node.js 24, pnpm workspaces
- `apps/web`: Next.js (App Router, Server Actions) na porta **3000**
- `apps/api`: Nest.js na porta **3001**
  - `GET /health` — saúde da API e checagem do Postgres
  - `GET /metrics` — métricas Prometheus (`prom-client`)
  - logs estruturados em JSON com `x-correlation-id`
- Postgres na porta **5432** (só em `127.0.0.1`), com Drizzle ORM e migrations em `apps/api/drizzle`

## Pré-requisitos

- Docker e Docker Compose
- Node.js 24 (há um `.nvmrc`) e [pnpm](https://pnpm.io/) 11, usados pelos comandos abaixo

## Rodando

```sh
cp .env.example .env
pnpm compose:down && pnpm compose:up   # docker compose down / docker compose up --build -d
```

As migrations são aplicadas automaticamente (serviço `migrate`) antes da API subir. Logs: `docker compose logs -f`.

| Serviço  | URL                           |
|----------|-------------------------------|
| Web      | http://localhost:3000         |
| API      | http://localhost:3001         |
| Health   | http://localhost:3001/health  |
| Metrics  | http://localhost:3001/metrics |
| Postgres | `127.0.0.1:5432`              |

## Testes

Com o ambiente no ar (`pnpm compose:up`):

```sh
pnpm install
pnpm test       # unitários
pnpm test:e2e   # integração com o Postgres (usa um banco separado, <POSTGRES_DB>_test)
```

Outros scripts: `pnpm lint`, `pnpm typecheck`, `pnpm build`, `pnpm db:migrate`.

## Variáveis de ambiente

Veja `.env.example`. Não commite o arquivo `.env`.
