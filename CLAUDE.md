# CLAUDE.md

Project conventions for the Grocery List Sharing App. Full requirements, data model, and API design live in `SPEC.md` — this file is conventions and rules only, not a duplicate of the spec.

Keep your replies extremely concise and focus on conveying the key information. no unnecessary fluff, no long code snippets.

## Project Structure

```
Grocery-app/
  web/    Vite + React + TypeScript frontend
  api/    NestJS backend
```

## Package Manager

This repo uses **two different package managers** — `web` and `api` are independent projects, not a shared workspace. Always use the right one for the folder you're in.

**`web/` — use `bun`**

- Install: `bun install`
- Run scripts: `bun run <script>`
- Add a dependency: `bun add <pkg>`
- Run one-off binaries: `bunx <pkg>`

**`api/` — use `npm`**

- Install: `npm install`
- Run scripts: `npm run <script>`
- Add a dependency: `npm install <pkg>`
- Run one-off binaries: `npx <pkg>` (e.g. `npx prisma migrate dev`)

Never mix them — don't run `bun install` inside `api/` or `npm install` inside `web/`, and don't add a root-level `package.json`/lockfile that tries to unify the two.

## Backend (`api`) Conventions

- NestJS, modules structured as `controller` + `service` + `dto/` per resource, matching SPEC.md section 6.1
- Every endpoint validated with `class-validator` DTOs — no unvalidated `any` request bodies
- Auth: Better Auth, integrated via its NestJS/Prisma adapter. Never hash or compare passwords manually — that's entirely Better Auth's responsibility
- Guards: `AuthGuard` for session checks, `RolesGuard` + `@Roles('ADMIN')` for admin-only routes — apply at controller or route level, not ad-hoc checks inside service methods
- All authenticated queries/mutations must be scoped to `req.user.id` unless the route is explicitly admin-only
- API versioned under `/api/v1`
- Error responses always shaped as `{ statusCode, message, error }`
- Prisma is the only data access layer — no raw SQL unless there's no reasonable Prisma equivalent, and if so, explain why in a code comment

## Frontend (`web`) Conventions

- **Strict UI separation**: `/admin/*` routes use **Ant Design only**. `/app/*` routes and public routes use **Tailwind CSS + shadcn/ui only**. Never import Ant Design components into `/app/*` or shadcn components into `/admin/*`.
- Two layout shells: `AdminLayout.tsx` (Ant `ConfigProvider` + `Layout`) and `AppLayout.tsx` (Tailwind base + shadcn). See SPEC.md section 7.2.
- **Data fetching: TanStack Query on top of a shared Axios client** — see SPEC.md section 7.2.1 for full conventions. Rules of thumb:
  - No manual `useEffect` + `useState` data fetching anywhere — always go through a `useXQuery`/`useXMutation` hook
  - One hook file per resource, colocated under `src/features/<resource>/`
  - Query keys are arrays, namespaced by resource (e.g. `['grocery', 'list']`)
  - Mutations invalidate the relevant query keys on success
  - Single `QueryClientProvider` at the app root, shared across both `/admin/*` and `/app/*`
- Auth: Better Auth client (`createAuthClient`), shared between admin and user login/register flows
- Route protection: `RequireAuth` wrapper for `/app/*`, `RequireAdmin` wrapper for `/admin/*`
- Strict TypeScript — no `any` unless justified with a comment

## Database

- PostgreSQL, schema defined in `SPEC.md` section 5, managed entirely through Prisma
- After any `schema.prisma` change: run `npx prisma format` then `npx prisma migrate dev`
- Never edit generated Prisma client output by hand

## Quality Gate

Before considering any task complete:

1. `web/`: `bun run lint` and `bun run typecheck` pass
2. `api/`: `npm run lint` and `npm run typecheck` (or `npm run build`, if no separate typecheck script) pass
3. Relevant tests pass (if present for that area)

## Working Style

- Follow `SPEC.md` as the source of truth for features, routes, data model, and API shape — don't invent new entities or endpoints without flagging it first
- When a requirement in SPEC.md is ambiguous, ask rather than guessing silently
- Work in small, verifiable phases (scaffold → connect → one module/feature at a time) rather than large multi-feature changes in one pass
- Keep admin and user codepaths independent enough that a change to one can't accidentally break the other
