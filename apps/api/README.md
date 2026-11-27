# API (`apps/api`)

API Nest.js da carteira financeira. A documentação de como rodar o monorepo está no [README da raiz](../../README.md).

Endpoints iniciais:

- `GET /` — informações básicas
- `GET /health` — saúde da API (e do Postgres, quando `DATABASE_URL` está definido)
- `GET /metrics` — métricas Prometheus (`prom-client`)
