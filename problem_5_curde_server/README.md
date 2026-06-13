# Problem 5: REST API (Express + TypeScript + Prisma + PostgreSQL)

A CRUD REST API built with **Express.js** and **TypeScript**, following **Clean Architecture**. It uses **Prisma** as the ORM and **PostgreSQL** for persistence.

## Features

- **Create** a resource — `POST /api/v1/resources`
- **List** resources with filters (status, search, pagination) — `GET /api/v1/resources`
- **Get** a resource by ID — `GET /api/v1/resources/:id`
- **Update** a resource — `PUT /api/v1/resources/:id`
- **Delete** a resource — `DELETE /api/v1/resources/:id`

## Project structure (Clean Architecture)

```
src/
├── domain/                    # Entities and repository contracts
│   └── shared/
│        └── paging-result.ts
│   └── resource/
│        ├── resource.ts
│        └── resource-repository.ts
│
├── application/               # Use cases
│   └── use-cases/
│        └── resource/
│             ├── resource-use-cases.ts   # ResourceUseCases interface
│             ├── createts
│             ├── get-list.ts
│             ├── get-by-id.ts
│             ├── update.ts
│             └── delete.ts
│
├── infrastructure/            # Database and external concerns
│   ├── database/
│   │   └── prisma-client.ts
│   └── repositories/
│       └── prisma-resource-repository.ts
│
├── presentation/                # HTTP (Express)
│   └── http/
│       ├── middleware/       # request logger, error handler
│       ├── app.ts             # createApp(options)
│       └── v1/
│            └── controllers/
│                 └── resource/
│                     ├── resource-routes.ts
│                     └── resource-controller.ts
│            └── schemas/
│                 └── resource.schema.ts
├── config.ts
└── index.ts                   # Composition root (wires repo, use cases, app)
```

Imports use path aliases: `@domain`, `@application`, `@infrastructure`, `@interfaces`, `@config` (see `tsconfig.json`).

## Prerequisites

- **Node.js** (v18+)
- **PostgreSQL** (running locally or via Docker)
- **npm** or **yarn**

## Configuration

1. **Environment variables**

   Copy the dev env file and set your database URL:

   ```bash
   cp .env.dev .env
   ```

   Edit `.env`:

   ```
   PORT=3000
   DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?schema=public"
   ```

   Replace `USER`, `PASSWORD`, `HOST`, and `DATABASE` with your PostgreSQL credentials. Example for a local DB:

   ```
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/problem5_db?schema=public"
   ```

2. **Create the database** (if it doesn’t exist):

   ```bash
   createdb problem5_db
   ```

   Or with Docker:

   ```bash
   docker run -d --name problem5-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=problem5_db -p 5432:5432 postgres:16
   ```

## Install and run

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Generate Prisma client and apply migrations**

   The repo includes an initial migration in `prisma/migrations/`. Apply it and generate the client:

   ```bash
   npm run db:generate
   npm run db:migrate
   ```

   Or, for a quick sync without migration files (e.g. prototyping): `npm run db:push`

3. **Run the application**

   Development (with auto-reload):

   ```bash
   npm run dev
   ```

   Production (build then start):

   ```bash
   npm run build
   npm start
   ```

   The server listens on `http://localhost:3000` (or the `PORT` from `.env`).

## Run with Docker Compose

You can run PostgreSQL and the app together with Docker Compose (no local Node or PostgreSQL required):

```bash
docker compose up -d
```

- **PostgreSQL** runs on port `5432` (user `postgres`, password `postgres`, database `problem5_db`).
- **App** runs on `http://localhost:3000`. Migrations are applied automatically on startup (`prisma migrate deploy`).

**If you see error P3005 ("The database schema is not empty")** — the database already has tables (e.g. from an earlier `db push`). Either:

1. **Baseline** (keep existing data): run once with the same `DATABASE_URL` as the app:
   ```bash
   npm run db:baseline
   ```
   Then start the app again; `migrate deploy` will see no pending migrations.

2. **Reset** (empty database): remove the volume and start fresh:
   ```bash
   docker compose down -v
   docker compose up --build
   ```

To run in the background:

```bash
docker compose up -d --build
```

To stop and remove containers (data is kept in a named volume):

```bash
docker compose down
```

To reset the database as well:

```bash
docker compose down -v
```

## Middleware

The app uses the following middleware (in order):

1. **Request logging** – [Winston](https://github.com/winstonjs/winston) logs every request (method, URL, status code, duration, user-agent). Set `LOG_LEVEL` (e.g. `debug`, `info`, `warn`, `error`) to control verbosity; default is `info` in production, `debug` otherwise. Logger lives in `src/infrastructure/logging/logger.ts`.

2. **Error handler** – Catches errors passed to `next(err)` and returns `500 Internal server error` with a generic message. Logs the error server-side.

## Swagger (OpenAPI)

Interactive API documentation is available at:

**http://localhost:3000/api-docs**

It lists all endpoints (health and resource CRUD), request/response schemas, and supports **Try it out** for sending requests.

The OpenAPI 3 spec is defined in `src/interfaces/http/openapi.ts`.

## API reference

Base URL: `http://localhost:3000/api/v1/resources`

### Response structure

All JSON responses use a consistent shape:

- **Success (200/201):** `{ data, message? }` — `data` holds the payload; `message` is optional.
- **Error (4xx/5xx):** `{ error, message? }` — `error` is a short code or description; `message` is optional.
- **Paginated list (200):** `{ data: [...], meta: { total, page, limit, totalPages }, message? }`.

Helpers live in `src/interfaces/http/utils/response.ts`: `sendSuccess`, `sendCreated`, `sendNoContent`, `sendError`, `sendValidationError`, `sendNotFound`, `sendPaginated`.

| Method   | Path       | Description                    |
|----------|------------|--------------------------------|
| POST     | /          | Create a resource              |
| GET      | /          | List resources (with filters)  |
| GET      | /:id       | Get resource by ID             |
| PUT      | /:id       | Update resource                |
| DELETE   | /:id       | Delete resource                |

### Create resource

```http
POST /api/v1/resources
Content-Type: application/json

{
  "name": "My resource",
  "description": "Optional description",
  "status": "active"
}
```

- **name** (required): non-empty string  
- **description** (optional): string or null  
- **status** (optional): string, default `"active"`

**Curl example** (create):

```bash
curl -s -X POST http://localhost:3000/api/v1/resources \
  -H "Content-Type: application/json" \
  -d '{"name":"My resource","description":"Optional description","status":"active"}'
```

### List resources

```http
GET /api/v1/resources?status=active&search=foo&page=1&limit=10
```

Query parameters:

- **status** (optional): filter by status
- **term** (optional): search in name and description (case-insensitive)
- **page** (optional): page number (default 1)
- **pSize** (optional): items per page (default 10, max 100)

Response shape:

```json
{
  "data": [...],
  "total": 42,
  "page": 1,
  "pSize": 10,
  "totalPages": 5
}
```

**Curl example** (list with filters):

```bash
curl -s "http://localhost:3000/api/v1/resources?status=active&term=foo&page=1&pSize=10"
```

### Get resource

```http
GET /api/v1/resources/:id
```

Returns 404 if not found.

**Curl example** (get by id):

```bash
curl -s "http://localhost:3000/api/v1/resources/{id}"
```

### Update resource

```http
PUT /api/v1/resources/:id
Content-Type: application/json

{
  "name": "New name",
  "description": "New description",
  "status": "inactive"
}
```

All body fields are optional; only provided fields are updated. Returns 404 if not found.

**Curl example** (update):

```bash
curl -s -X PUT "http://localhost:3000/api/v1/resources/{id}" \
  -H "Content-Type: application/json" \
  -d '{"name":"New name","description":"New description","status":"inactive"}'
```

### Delete resource

```http
DELETE /api/v1/resources/:id
```

Returns 204 on success, 404 if not found.

**Curl example** (delete):

```bash
curl -s -X DELETE "http://localhost:3000/api/v1/resources/{id}" -w "\nHTTP Status: %{http_code}\n"
```

## Health check

```http
GET /health
```

Returns `{ "status": "ok" }`.

**Curl example** (health):

```bash
curl -s http://localhost:3000/health
```

## Testing

Unit tests use [Jest](https://jestjs.io/) with [ts-jest](https://kulshekhar.github.io/ts-jest/) for TypeScript.

- **Use cases** are tested with a mocked `ResourceRepository` (no database).
- **Resource controller** is tested with mocked use cases (request/response and validation).

Run tests:

```bash
npm test
```

Watch mode and coverage:

```bash
npm run test:watch      # re-run on file changes
npm run test:coverage   # output coverage to coverage/
```

## Useful commands

| Command               | Description                          |
|-----------------------|--------------------------------------|
| `npm test`            | Run unit tests                       |
| `npm run test:watch`  | Run tests in watch mode              |
| `npm run test:coverage` | Run tests with coverage report   |
| `docker compose up --build` | Run PostgreSQL + app with Docker   |
| `docker compose down` | Stop containers (use `-v` to remove DB volume) |
| `npm run dev`         | Run with ts-node-dev                 |
| `npm run build`   | Compile TypeScript         |
| `npm start`       | Run compiled app           |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:migrate` | Create/apply migrations (default for schema changes) |
| `npm run db:migrate:deploy` | Apply pending migrations (production/CI) |
| `npm run db:baseline` | Mark initial migration as applied (fix P3005 when DB already has schema) |
| `npm run db:push` | Push schema without migration files (prototyping) |
| `npm run db:studio` | Open Prisma Studio       |
