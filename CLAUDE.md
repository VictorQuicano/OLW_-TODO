@AGENTS.md

# Our Little World

Private shared scrapbook for two people (Victor & Claudia): places to eat, places to visit,
movies/series, music, trips and activities — with an idea → planned → completed lifecycle,
approximate dates and per-person completion ("completed together").

It must feel like a personal, cinematic, slightly dreamy space with light 3D touches —
**never** a generic CRUD / SaaS dashboard.

## Source of truth

- `DESIGN.md` — visual language, UX, motion, 3D rules. Read before any UI/UX change.
- `ARCHITECTURE.md` — layers, domain model, storage, conventions. Read before structural changes.
- Do not edit either document without asking the user first.
- When they conflict, stop and ask.

## Stack

| Concern    | Choice                                                          |
| ---------- | --------------------------------------------------------------- |
| Framework  | Next.js 16 (App Router, Turbopack) + React 19 + TypeScript      |
| Hosting    | Vercel (Hobby / free)                                           |
| Styling    | Tailwind CSS v4 (CSS-first config in `src/app/globals.css`)     |
| Class util | `clsx` + `tailwind-merge` → expose a single `cn()` in `src/lib/utils` |
| Animation  | `motion` (import from `motion/react`, **not** `framer-motion`)  |
| 3D         | `three` + `@react-three/fiber` + `@react-three/drei`            |
| Icons      | `lucide-react`                                                  |
| Validation | `zod` (v4) — schemas live in `src/domain/**/**.schema.ts`       |
| Storage    | Turso (libSQL/SQLite) via `@libsql/client`, raw SQL, behind `ItemRepository` in `src/lib/storage` |
| Auth       | 2 users + PIN → HMAC-signed cookie; `getCurrentUser()` in `src/lib/auth` (ARCHITECTURE §51) |
| Pkg manager| **pnpm** (never npm/yarn; lockfile is `pnpm-lock.yaml`)         |

shadcn/ui is allowed "where appropriate" but is not installed. Only add individual
components when a primitive (dialog, popover, etc.) is genuinely needed, and restyle them
to the design language — the UI must not look like a component library.

## Environment

Copy `.env.example` → `.env.local`. Local dev uses `TURSO_DATABASE_URL=file:local.db`
(no token needed). Decisions already taken are in ARCHITECTURE.md §51 — don't reopen them
without asking.

## Commands

```bash
pnpm dev         # local dev server
pnpm typecheck   # next typegen && tsc --noEmit (typegen needed for LayoutProps/PageProps)
pnpm lint        # eslint (flat config)
pnpm build       # production build
```

Definition of done for any change: `pnpm typecheck && pnpm lint && pnpm build` all pass.

## Project layout

Code lives under `src/` (`@/*` → `./src/*`). Follow ARCHITECTURE.md §4; create folders only
when there is code to put in them.

```
src/app/          routes (Server Components by default)
src/components/   ui/, layout/, navigation/, items/, dashboard/, 3d/
src/domain/       items/ (types, schema, service, repository interface), users/
src/lib/          storage/ (provider implementations), auth/, utils/, constants/
src/hooks/        small client hooks
```

Dependency direction: `app → components → domain ← lib/storage`. Components never import a
storage provider; the domain never imports React, Next or a provider SDK.

## Next.js 16 gotchas (verify in `node_modules/next/dist/docs/` before using an API)

- `middleware.ts` is now **`proxy.ts`** (export `proxy`). Only use it for optimistic auth
  redirects; real authorization happens server-side in the data layer.
- `params`, `searchParams`, `cookies()`, `headers()` are **async** — always `await` them.
- Use the generated global types `PageProps<"/route">` / `LayoutProps<"/route">`.
- `dynamic(..., { ssr: false })` only works inside a **Client Component** — wrap 3D scenes in a
  small client wrapper and import that from the server page.
- Cache Components (`cacheComponents`, `"use cache"`) is **off**. Don't enable it without asking;
  mutations revalidate with `revalidatePath` / `refresh` per `docs/01-app/01-getting-started/09-revalidating.md`.
- Mutations: Server Actions (`"use server"`) validated with zod at the boundary.

## Conventions

- **Server Components by default**; `"use client"` only for forms, motion, 3D, browser APIs.
  Keep client islands small — never make a whole page a client component.
- Business rules (status transitions, `isCompletedTogether`, date formatting) live in
  `src/domain`, with unit tests when a test runner is added.
- Dates are flexible: `{ value, precision: "day" | "month" | "season" | "year" | "someday" }`.
  Render human text ("October 2026"), never raw ISO in the UI.
- Completion is per person (`completion.userA / userB`), never a single boolean.
- The two users are configured, not hardcoded in components (names come from config/env).
- Design tokens (color, type, radius, motion durations) as CSS variables in `globals.css`
  via Tailwind v4 `@theme`. No arbitrary `rounded-[17px]`-style values outside the tokens.
- Semantic colors: accent = interaction, green = completed, amber = planned,
  neutral = idea, red = destructive only.
- UI copy language: ask the user if unclear (default Spanish for UI text, English for code).
- Secrets only in env vars; keep `.env.example` updated; never commit `.env*`.

## 3D rules (short version of DESIGN.md §11 / ARCHITECTURE.md §19–20)

- All Three/R3F code stays in `src/components/3d/`. Nothing else imports `three`.
- Lazy-load every scene; render a static/CSS fallback when WebGL is missing,
  `prefers-reduced-motion` is set, or on low-power/mobile.
- Use `frameloop="demand"` or pause when off-screen; low poly, shared geometries/materials,
  capped DPR (`dpr={[1, 1.5]}`), no post-processing unless justified.
- 3D never blocks content or interaction and never takes most of the viewport.

## Motion rules

- Short (150–400 ms), purposeful: creation, status change, completion, navigation.
- Always respect reduced motion (`useReducedMotion` / `MotionConfig reducedMotion="user"`).
- No infinite decorative loops, no heavy bouncing.

## Working with the user

- Before large or hard-to-reverse changes, present the "Proposed approach" template from
  ARCHITECTURE.md §48 and wait for approval.
- Justify every new dependency (ARCHITECTURE.md §43).
