# syntax=docker/dockerfile:1

FROM node:22-bookworm-slim AS base
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable
WORKDIR /app

FROM base AS deps
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY services/api/package.json services/api/package.json
COPY packages/shared/package.json packages/shared/package.json
RUN pnpm install --frozen-lockfile --filter @readingos/api...

FROM deps AS build
ENV CI=true
COPY tsconfig.base.json turbo.json ./
COPY packages/shared packages/shared
COPY services/api services/api
RUN pnpm --filter @readingos/shared build
RUN pnpm --filter @readingos/api build
RUN pnpm install --frozen-lockfile --prod --filter @readingos/api...

FROM node:22-bookworm-slim AS runner
ENV NODE_ENV=production
WORKDIR /app

COPY --from=build /app/pnpm-lock.yaml /app/pnpm-workspace.yaml /app/package.json ./
COPY --from=build /app/services/api ./services/api
COPY --from=build /app/packages/shared ./packages/shared
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/services/api/node_modules ./services/api/node_modules

WORKDIR /app/services/api
EXPOSE 4000
CMD ["node", "dist/server.js"]
