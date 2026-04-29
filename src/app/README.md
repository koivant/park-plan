# `src/app`

## Structure

- `app.ts`: app composition only
- `http/`: core HTTP route registration
- `patch/`
  - `handlers/`: PATCH webhook routes
  - `schema/`: PATCH request schemas
  - `types/`: PATCH-specific types
  - `utils/`: PATCH-specific helpers
- `roller/`
  - `handlers/`: ROLLER webhook routes
  - `schema/`: ROLLER request schemas
  - `types/`: ROLLER-specific types
  - `utils/`: ROLLER-specific helpers
  - existing OAuth/bootstrap files remain here for ROLLER API setup
- `services/`: shared database-facing business logic
- `types/`: app-wide shared types
- `utils/`: app-wide reusable helpers
- `tests/`: API and utility tests
- `scripts/`: local generation and installer scripts

## Install

```bash
cd src/app
npm install
```

## Run

Use Node `v24`.

### Run On Host (local `npm run dev`)

Set `.env`:

```env
DATABASE_URL=postgres://loyalty:loyalty@localhost:5432/loyalty
```

Start development server:

```bash
cd src/app
npm run dev
```

### Run Inside Docker Network

When the API runs in the same Docker network as Postgres, use:

```env
DATABASE_URL=postgres://loyalty:loyalty@postgres:5432/loyalty
```

API docs:

```bash
cd src/app
npm run docs:api
```

Tests:

```bash
cd src/app
npm run test:api
```
