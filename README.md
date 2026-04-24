# Jamb — Frontend Assessment

Rebuild of the Jamb luxury-homeware homepage. Built as a CMS-driven page builder so the design stays author-editable end-to-end.

Frontend: **Next.js 16** (App Router, React 19, React Compiler, Turbopack) + **Tailwind v4**.
Content is modeled in Sanity so reviewers can see the page builder working — but the assignment scope is the frontend, not the CMS.

---

## What's on the page

A single homepage composed from five typed blocks in any order:

| Block              | What it is                                                               |
| ------------------ | ------------------------------------------------------------------------ |
| Hero               | Full-bleed image + in-page anchor nav                                    |
| Split              | Image + heading + copy + outline CTAs (Fireplaces / Lighting / Furniture) |
| Product Grid       | 3/4/5-col grid with adjustable image scale, aspect, and backgrounds       |
| Editorial          | Eyebrow + heading + copy + image + CTA (Journal feature)                  |
| Newsletter         | Subscribe-style section with image + CTA                                  |

Each block has a React component in `apps/web/src/components/sections/` and a matching schema in `apps/studio/schemaTypes/blocks/`. Dispatch happens in `apps/web/src/components/pagebuilder.tsx` via a `_type` → component map.

If Sanity has no `homePage` published, the page renders `components/demo-homepage.tsx` — the same layout wired with local PNGs. Lets the site work offline and makes the block components easier to iterate on without touching the CMS.

## Interactions

- **Lenis smooth scroll** with anchor-link hijack — clicking `#fireplaces` in the hero nav animates over 1.8s (quart ease), falls back to native under `prefers-reduced-motion`.
- **Preload intro** — first visit in a tab plays a FLIP animation that shrinks the hero from full-viewport to its final frame (1.6s). While it runs it warms all hero/grid assets via `new window.Image()` so the rest of the scroll is instant. Gated to once-per-tab via `sessionStorage`; a pre-hydration script in `layout.tsx` adds a skip class on reload so there's no overlay flash.
- **Entrance animation** on section headings only (via `motion/react`). Per-card staggers were removed because the brand feel is quiet, not motion-heavy.
- **Image preloading** in `layout.tsx` using `react-dom` `preload()` for the 17 PNGs above the fold.
- **Font loading** — four weights of Galaxie Copernicus + Galaxie Polaris Condensed Light (local), plus Inter (Google). All loaded via `next/font` with `display: swap`.

## Tech

- Next.js 16 + React 19 + React Compiler + Turbopack
- Tailwind v4 with `@theme inline` tokens and `@utility cta-transition` for the slow Apple-style hover
- Biome (Ultracite ruleset) — not ESLint/Prettier
- Turborepo + pnpm workspaces
- Sanity v5 + Presentation tool (visual editing / live preview)

## Layout

```
apps/
  web/      Next.js frontend — http://localhost:3000
  studio/   Sanity Studio    — http://localhost:3333
packages/
  env/                Zod-validated env
  sanity/             client, GROQ queries, generated types
  ui/                 Tailwind + Radix primitives
  logger/             structured logger
  typescript-config/
```

## Running it

Node ≥ 22, pnpm 10.x (corepack).

```bash
pnpm install
pnpm dev                    # web + studio together
pnpm dev:web                # Next.js only  → localhost:3000
pnpm dev:studio             # Sanity only   → localhost:3333

pnpm lint                   # Biome
pnpm format                 # Biome auto-fix
pnpm check-types            # tsc across workspace
```

After a schema change: `cd apps/studio && pnpm type` to regenerate types.

## What's intentionally out of scope

Frontend-only assessment, so the following are stubbed or unbuilt:

- Mobile nav drawer — menu icon is a placeholder
- Footer search + newsletter form — no submit handler
- `/products/[slug]` routing — card `href` field exists but unused
- Tests
- Deploy config

## What the CMS work covers

Only enough to prove the page builder is real:

- Five block schemas
- GROQ fragments with nested image + URL resolution
- Codegen wired (`sanity.types.ts`)
- Visual editing attributes and `useOptimistic` for live preview in Presentation

Seeding the homepage document takes ~5 min through the Studio UI. The demo fallback covers the reviewer flow that skips setting up Sanity locally.
