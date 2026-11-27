# Carteira financeira — Grupo Adriano Cobuccio

Desafio técnico: monorepo com **Next.js** (`apps/web`), **Nest.js** (`apps/api`) e **TypeScript**. A forma principal de rodar o ambiente é o **Docker Compose**.

## Stack

- Node.js 24, pnpm workspaces
- `apps/web`: Next.js (App Router, TypeScript, pronto para Server Actions) na porta **3000**
- `apps/api`: Nest.js (TypeScript) na porta **3001**
  - `GET /health` — saúde da API e checagem simples do Postgres
  - `GET /metrics` — métricas Prometheus (`prom-client`: defaults + contador/histograma HTTP)
  - logs estruturados em JSON com `x-correlation-id` (gera se o header não vier e devolve na resposta)
- Postgres na porta **5432**, exposta apenas em `127.0.0.1`

A arquitetura de domínio ainda não foi implementada. A pasta `apps/api/src/modules` está preparada para Clean Architecture por módulo (`domain` / `application` / `infra`).

## Pré-requisitos

- Node.js 20+ (recomendado 24; há um `.nvmrc` na raiz)
- [pnpm](https://pnpm.io/) 11
- Docker e Docker Compose (para o fluxo principal)

## Rodando com Docker Compose (recomendado)

```sh
cp .env.example .env
docker compose up -d --build
```

Serviços:

| Serviço  | URL                          |
|----------|------------------------------|
| Web      | http://localhost:3000        |
| API      | http://localhost:3001        |
| Health   | http://localhost:3001/health |
| Metrics  | http://localhost:3001/metrics |
| Postgres | `127.0.0.1:5432`             |

Para encerrar (o volume do Postgres é preservado):

```sh
docker compose down
```

## Rodando localmente (sem Docker, exceto o banco)

Suba só o Postgres:

```sh
cp .env.example .env
docker compose up -d postgres
```

No `.env`, mantenha `DATABASE_URL` com host `localhost`. Depois:

```sh
pnpm install
pnpm dev
```

Isso sobe a API em `http://localhost:3001` e o web em `http://localhost:3000`.

Scripts úteis na raiz:

```sh
pnpm dev        # web + api em paralelo
pnpm dev:web
pnpm dev:api
pnpm build
pnpm lint
pnpm test
```

## Variáveis de ambiente

Veja `.env.example`. Não commite o arquivo `.env`. Os valores de exemplo são apenas para desenvolvimento local.
