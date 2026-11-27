# Módulos de domínio

Cada módulo de negócio deve seguir Clean Architecture, com estas pastas:

```
src/modules/<nome-do-modulo>/
  domain/         # entidades, value objects e contratos (ex.: repositórios)
  application/    # casos de uso — commands e queries separados só nesta camada
  infra/          # implementações (persistência, HTTP, mensageria)
```

O banco é compartilhado entre os módulos. Nenhum domínio foi implementado neste setup inicial.
