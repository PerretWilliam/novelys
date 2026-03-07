# Novelys API

Novelys backend built with Express and SQLite.

## Scripts

```bash
pnpm dev
pnpm build
pnpm start
pnpm db:migrate
pnpm db:seed
```

## Environment variables

Copy `.env.example` to `.env` and define at least:

- `PORT`
- `DATABASE_FILE`
- `API_TOKEN`

## Docker

From the monorepo root:

```bash
docker compose -f services/api/compose.yml up --build -d
```
