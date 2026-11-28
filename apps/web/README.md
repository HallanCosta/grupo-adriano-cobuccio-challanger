# Web (`apps/web`)

Frontend Next.js (App Router) da carteira financeira. A documentação de como rodar o monorepo está no [README da raiz](../../README.md).

## Testes e2e

Com o stack do Compose no ar (`pnpm compose:up` na raiz), na primeira vez instale o Chromium e depois rode:

```sh
pnpm --filter web exec playwright install chromium
pnpm test:e2e:web
```

A URL base padrão é `http://localhost:3000`. Para apontar para outro host:

```sh
PLAYWRIGHT_BASE_URL=http://localhost:3000 pnpm test:e2e:web
```

Os testes cobrem o cadastro (`/cadastro`) e o login (`/login`, `/carteira`).
A URL da API usada para criar usuários de teste pode ser trocada com
`PLAYWRIGHT_API_URL` (padrão `http://localhost:3001`).
