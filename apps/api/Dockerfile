# syntax=docker/dockerfile:1

FROM node:24-alpine AS base
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable && corepack prepare pnpm@11.13.0 --activate
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
RUN pnpm install --frozen-lockfile

FROM deps AS build
COPY tsconfig.base.json ./
COPY apps/api ./apps/api
RUN pnpm --filter api build
# --legacy inclui o dist mesmo com dist no .gitignore
RUN pnpm --filter api deploy --prod --legacy /deploy

FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV API_PORT=3001
RUN addgroup -S nestjs && adduser -S nestjs -G nestjs
COPY --from=build --chown=nestjs:nestjs /deploy ./
USER nestjs
EXPOSE 3001
CMD ["node", "dist/main.js"]
