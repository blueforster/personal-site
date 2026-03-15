# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run dev          # Start dev server (Next.js 16 + Turbopack)
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint

# Database (Prisma v7)
npm run db:generate  # Generate Prisma client after schema changes
npm run db:push      # Push schema changes to DB (no migration files)
npm run db:studio    # Open Prisma Studio GUI
```

## Architecture

The app uses two route groups:

- `src/app/(site)/` — public-facing frontend (SSG/ISR pages)
- `src/app/(cms)/` — admin-only backend (Keystatic CMS UI + custom admin page)

Middleware (`src/middleware.ts`) protects `/keystatic/*` and `/admin/*` routes via NextAuth JWT, requiring `role === 'ADMIN'`.

### Content Layer (Keystatic)

Keystatic is the Git-based CMS. Config is at `keystatic.config.ts` (GitHub storage mode). Collections: `posts`, `courses`, `portfolio`, `categories`. All content is stored as `.mdx` files under `src/content/`.

**Reading content in server components**: always use helpers from `src/lib/keystatic.ts` (`getPublishedPosts`, `getPostBySlug`, etc.) which call `createReader()` — never import `keystatic.config.ts` directly in page components.

Content files use YAML frontmatter + MDX body in a **single `.mdx` file per item** (not a directory). The `title` field (used as `slugField`) is stored as a plain string in frontmatter.

### Database Layer (Prisma v7 + PlanetScale MySQL)

Schema: `prisma/schema.prisma`. Prisma config: `prisma/prisma.config.ts` (uses `defineConfig()` — this is required by Prisma v7, do not put `url` in the datasource block in `schema.prisma`).

Models: `Post`, `Comment`, `Like`, `ScheduledJob`, `User`, `Purchase`.

`src/lib/prisma.ts` exports a singleton `prisma` client. If `DATABASE_URL` is not set, it returns a proxy that throws descriptive errors — the site still builds and renders without a DB connection.

### Search

Search is implemented with **FlexSearch** (client-side, `src/lib/search.ts`) — not Algolia, despite the SDD. The `SearchDialog` component (`src/components/blog/SearchDialog.tsx`) builds an in-memory index from all published posts.

### Auth (NextAuth v4)

Config in `src/lib/auth.ts`. Uses Google OAuth. On sign-in, upserts a `User` record in the DB. The first user whose email matches `ADMIN_EMAIL` env var gets `role: 'ADMIN'`. Role is stored in the JWT and checked by middleware.

### Payments (Stripe)

Course purchases use Stripe Checkout (`src/app/api/checkout/route.ts`), webhook at `src/app/api/stripe/webhook/route.ts`. Purchase records stored in DB via `Purchase` model. `PurchaseButton` component checks purchase status at `/api/purchases/check`.

### Social Publishing

`/api/publish` handles multi-platform publishing (website revalidation + Meta Graph API for Facebook/Instagram/Threads). `/api/schedule` stores scheduled jobs in DB; GitHub Actions (`.github/workflows/scheduled-publish.yml`) calls `/api/schedule/trigger` on a cron schedule.

### Rendering Strategy

- Blog post detail (`/blog/[slug]`): SSG via `generateStaticParams()` — builds all published posts at build time
- `ViewTracker` component fires a `POST /api/views` call on the client to increment view counts without blocking SSR
- OG images generated dynamically via `/api/og` using `@vercel/og`

## Key Environment Variables

```
DATABASE_URL             # PlanetScale MySQL connection string
NEXTAUTH_SECRET
NEXTAUTH_URL
ADMIN_EMAIL              # Grants ADMIN role on first sign-in
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
GITHUB_REPO_OWNER        # For Keystatic GitHub storage
GITHUB_REPO_NAME
META_ACCESS_TOKEN        # Meta Graph API (FB/IG/Threads)
META_PAGE_ID
META_IG_USER_ID
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
CRON_SECRET              # Protects /api/schedule/trigger
NEXT_PUBLIC_SITE_URL
```

## Important Gotchas

- **React 19 + hooks**: Do not call `setState` directly inside `useEffect`. Use `useMemo`, `requestAnimationFrame`, or refs.
- **Prisma v7**: Do not add `url = env("DATABASE_URL")` to the datasource block in `schema.prisma`. The URL is configured in `prisma/prisma.config.ts`.
- **shadcn/ui v4**: Uses Tailwind v4. CSS is imported via `@import "shadcn/tailwind.css"` and `tw-animate-css`, not `tailwind.config.ts` theme extension.
- **Keystatic `slugField`**: The `title` field (declared with `fields.slug(...)`) stores its value as a plain string in frontmatter, not as an object.
- **Keystatic storage**: Uses GitHub storage mode (not `local`). Requires `GITHUB_REPO_OWNER` and `GITHUB_REPO_NAME` env vars.
- **`/api/keystatic/*`** is intentionally excluded from middleware auth — Keystatic needs those routes for its own OAuth callback flow.
