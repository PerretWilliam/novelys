<div align="center">

# Novelys

**Collaborative reading and writing platform**

[![Node.js](https://img.shields.io/badge/Node.js-22+-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org)
[![pnpm](https://img.shields.io/badge/pnpm-10+-F69220?style=flat-square&logo=pnpm&logoColor=white)](https://pnpm.io)
[![React Native](https://img.shields.io/badge/React_Native-Expo-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactnative.dev)
[![Docker](https://img.shields.io/badge/Docker-ready-2496ED?style=flat-square&logo=docker&logoColor=white)](https://www.docker.com)
[![Express](https://img.shields.io/badge/Express-5-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com)
[![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](./LICENSE)

</div>

---

## Overview

Novelys is a mobile platform for collaborative reading and writing. This repository is a **monorepo** that holds all project packages — a Dockerized Express backend, a React Native mobile app, and a shared library.

## Project Structure

```
novelys/
├── apps/
│   └── mobile/          # Mobile application (Expo / React Native)
├── services/
│   └── api/             # REST API (Express + SQLite, Docker)
└── packages/
    └── shared/          # Shared TypeScript contracts and utilities
```

## Prerequisites

| Tool                             | Minimum version |
| -------------------------------- | --------------- |
| [Node.js](https://nodejs.org)    | 22+             |
| [pnpm](https://pnpm.io)          | 10+             |
| [Docker](https://www.docker.com) | latest          |

## Installation

Clone the repository and install dependencies from the monorepo root:

```bash
git clone https://github.com/your-org/novelys.git
cd novelys
pnpm install
```

## Development

Start the backend and the mobile app in two separate terminals:

```bash
# Terminal 1 — API (runs inside Docker)
pnpm dev:api

# Terminal 2 — Mobile app
pnpm dev:mobile
```

## Database

Initialize and seed the SQLite database:

```bash
# Apply migrations
pnpm db:migrate

# Inject test data
pnpm db:seed
```

## Packages

### `services/api`

REST API built with **Express** and **SQLite**, containerized with **Docker**. Exposes the endpoints consumed by the mobile application.

### `apps/mobile`

Mobile application built with **Expo** and **React Native**. Supports both iOS and Android.

### `packages/shared`

Internal library containing shared TypeScript types, validation schemas, and utilities used across the backend and the mobile app.

## Contributing

1. Branch off `main`: `git checkout -b feat/my-feature`
2. Commit your changes: `git commit -m "feat: description"`
3. Open a Pull Request

Commit messages follow the [Conventional Commits](https://www.conventionalcommits.org/) convention.

## Author

Made by [William Perret](https://william-perret.fr)

[Website](https://william-perret.fr) · [GitHub](https://github.com/PerretWilliam) · [LinkedIn](https://www.linkedin.com/in/william-perret-7102b7327) · [Instagram](https://www.instagram.com/williamprrt/profilecard/?igsh=MWoza3kxbXpybmhybQ==) · [Buy Me a Coffee](https://buymeacoffee.com/perretwilliam)

---

## License

[MIT](./LICENSE)
