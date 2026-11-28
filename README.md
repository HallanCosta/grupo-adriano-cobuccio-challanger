# Carteira financeira — Grupo Adriano Cobuccio

Desafio técnico: monorepo com **Next.js** (`apps/web`), **Nest.js** (`apps/api`) e **TypeScript**. A forma principal de rodar o ambiente é o **Docker Compose**.

## Stack

- Node.js 24, pnpm workspaces
- `apps/web`: Next.js (App Router, Server Actions) na porta **3000**
- `apps/api`: Nest.js na porta **3001**
  - `POST /auth/register` — cadastro de usuário (página `/cadastro` no web)
  - `POST /auth/login` — login; devolve um JWT (página `/login` no web)
  - `GET /auth/me` — usuário autenticado (exige `Authorization: Bearer <token>`)
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
| Cadastro | http://localhost:3000/cadastro |
| Login    | http://localhost:3000/login    |
| Carteira | http://localhost:3000/carteira (exige login) |
| API      | http://localhost:3001         |
| Health   | http://localhost:3001/health  |
| Metrics  | http://localhost:3001/metrics |
| Postgres | `127.0.0.1:5432`              |

## Autenticação

- A API assina um JWT (`@nestjs/jwt`, HS256) no `POST /auth/login`. Todas as rotas exigem `Authorization: Bearer <token>`, exceto as marcadas com `@Public()` (`/`, `/health`, `/metrics`, `POST /auth/register` e `POST /auth/login`).
- Credenciais erradas (e-mail inexistente ou senha incorreta) devolvem sempre o mesmo `401 INVALID_CREDENTIALS`.
- O web guarda o token em um cookie `httpOnly` (`gac_session`) pela Server Action de `/login`. "Lembrar de mim" torna o cookie persistente; sem ele, é um cookie de sessão. Em HTTPS, defina `SESSION_COOKIE_SECURE=true`.
- Configuração (veja `.env.example`): `JWT_SECRET` (obrigatório, mínimo de 32 caracteres; a API não sobe sem ele) e `JWT_EXPIRES_IN` (segundos, padrão 3600). Gere um segredo com `openssl rand -base64 48`.

## Testes

Com o ambiente no ar (`pnpm compose:up`):

```sh
pnpm install
pnpm test            # unitários
pnpm test:e2e        # API (Vitest) + web (Playwright)
pnpm test:e2e:api    # integração da API com o Postgres (banco separado, <POSTGRES_DB>_test)
pnpm test:e2e:web    # Playwright em /cadastro e /login, contra o Compose (http://localhost:3000)
```

Na primeira execução do e2e web, instale o Chromium do Playwright:

```sh
pnpm --filter web exec playwright install chromium
```

A URL base do e2e web pode ser trocada com `PLAYWRIGHT_BASE_URL` (padrão `http://localhost:3000`) e a URL da API usada para criar usuários de teste com `PLAYWRIGHT_API_URL` (padrão `http://localhost:3001`).

Outros scripts: `pnpm lint`, `pnpm typecheck`, `pnpm build`, `pnpm db:migrate`.

## Variáveis de ambiente

Veja `.env.example`. Não commite o arquivo `.env`.
