# Módulos de domínio

Cada módulo de negócio deve seguir Clean Architecture, com estas pastas:

```
src/modules/<nome-do-modulo>/
  domain/         # entidades, value objects e contratos (ex.: repositórios)
  application/    # casos de uso — commands e queries separados só nesta camada
  infra/          # implementações (persistência, HTTP, mensageria)
```

O banco é compartilhado entre os módulos (schema único em `src/shared/infra/database/schema.ts`).

Módulos atuais:

- `auth` — cadastro de usuário (`application/commands/registerUser.ts`).
- `ledger` — contas (`USER_WALLET`, `EXTERNAL_CASH`); por enquanto só abre a carteira do usuário no cadastro.

Convenções: arquivos e pastas em lowerCamelCase, sem sufixo `use-case`. Ports são classes abstratas em `domain/ports` e servem de token de injeção do Nest; as implementações ficam em `infra`.
