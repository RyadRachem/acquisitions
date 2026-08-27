# Acquisitions API - Docker & Neon Database Guide

This project is a high-performance Node.js & Express REST API using [Drizzle ORM](https://orm.drizzle.team/) and [Neon Serverless Postgres](https://neon.tech/).

It is configured with a hybrid database architecture:
- **Local Development**: Runs [Neon Local](https://neon.tech/docs/local/neon-local) via Docker to automatically provision and destroy **ephemeral cloud database branches** for isolated development and testing.
- **Production**: Connects directly to **Neon Cloud Serverless Postgres** over secure TLS with zero proxy overhead and injected environment variables.

---

## 🏛️ Architecture Overview

```mermaid
graph TD
  subgraph Local Development [Development: docker-compose.dev.yml]
    DevApp[Node.js App Container] -->|HTTP / SQL| NeonLocalProxy[Neon Local Proxy: neondatabase/neon_local]
    NeonLocalProxy -->|Neon API / Ephemeral Branch| NeonCloudDev[(Neon Ephemeral Branch)]
  end

  subgraph Production [Production: docker-compose.prod.yml]
    ProdApp[Node.js App Container] -->|Direct TLS / Serverless Driver| NeonCloudProd[(Neon Cloud Production DB)]
  end
```

---

## ⚙️ Environment Variables Comparison

| Environment Variable | Local Development (`.env.development`) | Production (`.env.production` / Secret Manager) | Description |
| :--- | :--- | :--- | :--- |
| `NODE_ENV` | `development` | `production` | Application runtime environment |
| `PORT` | `3000` | `3000` | Application HTTP listening port |
| `DATABASE_URL` | `postgres://neon:npg@neon-local:5432/neondb` | `postgresql://<user>:<pwd>@<ep>.neon.tech/neondb?sslmode=require` | Database connection string |
| `NEON_FETCH_ENDPOINT` | `http://neon-local:5432/sql` | *Not set* (uses cloud default) | Directs `@neondatabase/serverless` to the local proxy |
| `NEON_API_KEY` | `nkey_...` (from Neon Console) | *Not used in container* | API Key for branch orchestration |
| `NEON_PROJECT_ID` | `epic-project-123456` | *Not used in container* | Neon Project ID |
| `PARENT_BRANCH_ID` | *Optional* (default: main branch) | *Not used* | Base branch for ephemeral forks |
| `DELETE_BRANCH` | `true` | *Not used* | Cleans up branch when container stops |
| `ARCJET_KEY` | `ajkey_...` | Production Arcjet Key | Arcjet security key |
| `JWT_SECRET` | `dev_secret_key` | Strong 256-bit secret | JWT signing secret |

---

## 🚀 Local Development (with Neon Local)

### 1. Prerequisites
- [Docker & Docker Compose](https://docs.docker.com/get-docker/) installed.
- A [Neon](https://console.neon.tech/) account.
  - Create an API key at [Neon Console -> Account Settings -> API Keys](https://console.neon.tech/app/settings/api-keys).
  - Find your Project ID at [Neon Console -> Project Settings -> General](https://console.neon.tech/).

### 2. Configure Local Environment
Create or edit `.env.development`:

```env
PORT=3000
NODE_ENV=development
LOG_LEVEL=debug

# Neon Local Proxy within Docker network
DATABASE_URL=postgres://neon:npg@neon-local:5432/neondb
NEON_FETCH_ENDPOINT=http://neon-local:5432/sql

# Neon API credentials for automatic branch lifecycle
NEON_API_KEY=your_neon_api_key_here
NEON_PROJECT_ID=your_neon_project_id_here
DELETE_BRANCH=true

ARCJET_ENV=development
ARCJET_KEY=ajkey_01kwercgb7ers8n3ddqyee3w91
JWT_SECRET=dev-jwt-secret-key-12345
```

### 3. Start Development Environment
Run Docker Compose with the development configuration:

```bash
docker compose -f docker-compose.dev.yml up --build
```

**What happens automatically:**
1. Neon Local starts and calls the Neon API to create a new, isolated **ephemeral branch** branched off your default branch.
2. The Node.js application starts with live code reloading (`node --watch`).
3. Queries sent to `http://neon-local:5432/sql` are transparently proxied to your ephemeral Neon branch.

### 4. Running Migrations in Development
In another terminal, execute Drizzle migrations inside the running container:

```bash
docker compose -f docker-compose.dev.yml exec app npm run db:migrate
```

### 5. Stopping and Branch Cleanup
Stop the compose stack:

```bash
docker compose -f docker-compose.dev.yml down
```

> **Note:** When the `neon-local` container stops, it automatically deletes the ephemeral cloud database branch, keeping your Neon project clean and free of leftover test branches.

---

## 🏭 Production Deployment (with Neon Cloud)

In production, no proxy container is run. The containerized application connects directly to your managed Neon serverless database.

### 1. Configure Production Secrets
Create `.env.production` or inject variables via your cloud orchestrator (AWS ECS, Kubernetes, GCP Cloud Run, Docker Swarm, etc.):

```env
PORT=3000
NODE_ENV=production
LOG_LEVEL=info

# Direct Neon Cloud Serverless Database URL (pooled or unpooled)
DATABASE_URL=postgresql://neondb_owner:YOUR_PASSWORD@ep-bitter-night-atqzghy2-pooler.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

ARCJET_ENV=production
ARCJET_KEY=your_production_arcjet_key
JWT_SECRET=your_super_strong_production_jwt_secret_key
```

### 2. Build and Deploy Production Container
Run Docker Compose with the production configuration:

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

### 3. Run Production Migrations
Run schema migrations against your production database:

```bash
docker compose -f docker-compose.prod.yml exec app npm run db:migrate
```

### 4. View Production Logs
```bash
docker compose -f docker-compose.prod.yml logs -f app
```

---

## 🛠️ Advanced Neon Local Workflows

### Connecting to an Existing Branch
If you want to test against a specific branch instead of creating an ephemeral one:

1. In `.env.development`, add `BRANCH_ID=br-your-branch-id`.
2. In `docker-compose.dev.yml`, uncomment `BRANCH_ID: ${BRANCH_ID:-}` under `neon-local.environment`.

### Persisting Branches per Git Branch
To keep an ephemeral branch alive across Docker restarts for the same Git branch:
1. Set `DELETE_BRANCH=false` in `.env.development`.
2. Mount `.neon_local/` directory and `.git/HEAD` into the `neon-local` service:
   ```yaml
   volumes:
     - ./.neon_local/:/tmp/.neon_local
     - ./.git/HEAD:/tmp/.git/HEAD:ro
   ```

---

## 📦 Project Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Run app locally with file watch |
| `npm run db:generate` | Generate Drizzle migrations |
| `npm run db:migrate` | Apply Drizzle migrations |
| `npm run db:studio` | Launch Drizzle Studio DB viewer |
| `npm run lint` | Lint codebase with ESLint |
| `npm run format` | Format code with Prettier |
