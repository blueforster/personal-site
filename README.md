# NS Web - Personal Brand Website

A full-featured personal brand website built with Next.js, featuring a blog, courses, portfolio, and a built-in CMS.

Topics: **numerology / AI / book reviews / social observation**

## Tech Stack

| Layer        | Technology                                    |
| ------------ | --------------------------------------------- |
| Framework    | Next.js 16 (App Router, Turbopack)            |
| Language     | TypeScript 5 (strict)                         |
| UI           | Tailwind CSS 4 + shadcn/ui + Radix UI         |
| CMS          | Keystatic (local Git-based, MDX content)      |
| Database     | PlanetScale MySQL via Prisma 7                |
| Auth         | NextAuth.js v4 (Google provider)              |
| Payments     | Stripe Checkout (card, Google Pay, Apple Pay)  |
| Search       | FlexSearch (client-side, zero external deps)  |
| Social       | Meta Graph API (Facebook / Instagram / Threads) |
| Cross-post   | Substack draft API                            |
| Media        | Cloudinary CDN                                |
| OG Images    | @vercel/og (dynamic generation)               |
| Icons        | Lucide React                                  |

## Features

- **Blog** -- MDX articles with table of contents, reading time, comments, likes, view count
- **Search** -- Full-text search via FlexSearch with Cmd+K shortcut, category filtering, sorting, pagination
- **Share** -- Social share buttons (Facebook, X, LINE, LinkedIn, Email, copy link, native share on mobile)
- **Courses** -- Video course pages with chapter navigation, YouTube embed, Stripe payment, and access gating
- **Portfolio** -- Masonry grid gallery with lightbox
- **CMS** -- Keystatic admin UI at `/keystatic` for managing all content
- **Social Publishing** -- Cross-post to Facebook, Instagram, Threads, and Substack
- **Scheduled Publishing** -- Cron-based post scheduling with platform selection
- **Dark Mode** -- System-aware theme toggle via next-themes
- **SEO** -- Per-page metadata (title, description, OpenGraph, Twitter card, canonical URL), dynamic OG images, sitemap.xml, robots.txt, JSON-LD structured data (WebSite schema globally, Article schema per blog post)
- **RWD** -- Responsive design across all pages (mobile-first)

## Project Structure

```
src/
├── app/
│   ├── (cms)/                   # Keystatic CMS admin
│   │   └── keystatic/[[...params]]/page.tsx
│   ├── (site)/                  # Public site
│   │   ├── page.tsx             # Home
│   │   ├── blog/                # Blog list + detail
│   │   ├── courses/             # Course list + detail
│   │   ├── portfolio/
│   │   │   ├── page.tsx         # Server component (metadata + data fetch)
│   │   │   └── PortfolioClient.tsx # Client component (filter/lightbox state)
│   │   ├── about/               # About page
│   │   └── layout.tsx           # Site layout (navbar, footer, search)
│   ├── api/
│   │   ├── auth/[...nextauth]/  # NextAuth endpoint
│   │   ├── comments/            # Comment CRUD
│   │   ├── likes/               # Like toggle
│   │   ├── views/               # View counter
│   │   ├── publish/             # Social publishing
│   │   ├── schedule/            # Scheduled post execution
│   │   ├── og/                  # Dynamic OG image generation
│   │   └── keystatic/           # Keystatic API handler
│   ├── layout.tsx               # Root layout (theme, fonts)
│   ├── globals.css
│   ├── robots.ts
│   └── sitemap.ts
├── components/
│   ├── blog/                    # PostCard, PostList, SearchDialog,
│   │                            # ShareButtons, CommentSection,
│   │                            # LikeButton, TableOfContents
│   ├── courses/                 # VideoPlayer, PurchaseButton
│   ├── portfolio/               # MasonryGrid, Lightbox
│   ├── shared/                  # Navbar, Footer, ThemeToggle, SiteShell, AuthProvider
│   └── ui/                      # shadcn/ui primitives
├── content/                     # Keystatic content (Git-tracked MDX)
│   ├── posts/
│   ├── courses/
│   ├── portfolio/
│   └── categories/
├── lib/
│   ├── auth.ts                  # NextAuth config
│   ├── cloudinary.ts            # Image upload helper
│   ├── keystatic.ts             # Content reading helpers
│   ├── meta-api.ts              # Facebook / IG / Threads publishing
│   ├── prisma.ts                # Prisma client singleton
│   ├── search.ts                # FlexSearch index & query
│   ├── stripe.ts                # Stripe SDK singleton
│   ├── substack.ts              # Substack cross-posting
│   └── utils.ts                 # cn(), formatDate(), readingTime(), stripMdx()
└── types/
    ├── index.ts                 # Shared TypeScript types
    └── next-auth.d.ts           # NextAuth session type augmentation
```

## Getting Started

### Prerequisites

- Node.js 18+
- MySQL database (PlanetScale recommended)

### Installation

```bash
# Clone the repo
git clone https://github.com/YOUR_USER/personal-site.git
cd personal-site

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your values
```

### Environment Variables

```bash
# Required
DATABASE_URL=                     # MySQL connection string
NEXTAUTH_SECRET=                  # openssl rand -base64 32
NEXTAUTH_URL=http://localhost:3000
ADMIN_EMAIL=                      # Email for admin role assignment
GOOGLE_CLIENT_ID=                 # Google OAuth client ID
GOOGLE_CLIENT_SECRET=             # Google OAuth client secret
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Required - Keystatic CMS (GitHub storage)
KEYSTATIC_GITHUB_CLIENT_ID=       # GitHub OAuth App client ID
KEYSTATIC_GITHUB_CLIENT_SECRET=   # GitHub OAuth App client secret
KEYSTATIC_SECRET=                 # openssl rand -base64 32
GITHUB_REPO_OWNER=                # GitHub username or org
GITHUB_REPO_NAME=                 # Repository name

# Optional - Social Publishing
META_ACCESS_TOKEN=                # Meta Graph API token
META_PAGE_ID=                     # Facebook Page ID
META_IG_USER_ID=                  # Instagram Business User ID
SUBSTACK_API_KEY=                 # Substack session token
SUBSTACK_PUBLICATION_URL=         # e.g. https://yourname.substack.com

# Optional - Media
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Optional - Newsletter
CONVERTKIT_API_KEY=
CONVERTKIT_FORM_ID=

# Optional - Cron
CRON_SECRET=                      # Auth token for /api/schedule/trigger

# Stripe (required for paid courses)
STRIPE_SECRET_KEY=                # Stripe secret key (sk_test_ or sk_live_)
STRIPE_WEBHOOK_SECRET=            # Stripe webhook signing secret (whsec_)
```

### Database Setup

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Open database GUI (optional)
npm run db:studio
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the website and [http://localhost:3000/keystatic](http://localhost:3000/keystatic) for the CMS admin.

## Scripts

| Command            | Description                    |
| ------------------ | ------------------------------ |
| `npm run dev`      | Start dev server (Turbopack)   |
| `npm run build`    | Production build               |
| `npm start`        | Start production server        |
| `npm run lint`     | Run ESLint                     |
| `npm run db:generate` | Generate Prisma client      |
| `npm run db:push`  | Sync schema to database        |
| `npm run db:studio`| Open Prisma Studio GUI         |

## Database Schema

Six models managed via Prisma:

- **Post** -- slug, title, status, view count, publish platforms, timestamps
- **Comment** -- author name, content, approval status, IP hash (rate limiting)
- **Like** -- unique per post + IP hash (deduplication)
- **ScheduledJob** -- post slug, target platforms, schedule time, execution status
- **User** -- email, name, image, role (USER/ADMIN), linked purchases
- **Purchase** -- user, course slug, Stripe session/payment IDs, amount, currency, status

## Content Management

Content is managed through [Keystatic](https://keystatic.com/) with 4 collections:

| Collection     | Path                        | Format  |
| -------------- | --------------------------- | ------- |
| Posts          | `src/content/posts/`         | MDX     |
| Courses        | `src/content/courses/`       | MDX     |
| Portfolio      | `src/content/portfolio/`     | MDX     |
| Categories     | `src/content/categories/`    | YAML    |

Access the CMS at `/keystatic` (requires admin login via Google).

## API Routes

| Endpoint                   | Method   | Description                       |
| -------------------------- | -------- | --------------------------------- |
| `/api/auth/[...nextauth]`  | GET/POST | NextAuth authentication           |
| `/api/comments?slug=`      | GET      | Fetch approved comments           |
| `/api/comments`            | POST     | Submit new comment                |
| `/api/likes`               | GET/POST | Check / toggle like               |
| `/api/views`               | POST     | Increment view count              |
| `/api/publish`             | POST     | Publish to social platforms       |
| `/api/schedule`            | POST     | Create scheduled publish job      |
| `/api/schedule/trigger`    | POST     | Execute due scheduled jobs (cron) |
| `/api/og?title=&category=` | GET      | Generate dynamic OG image         |
| `/api/checkout`              | POST     | Create Stripe checkout session    |
| `/api/stripe/webhook`        | POST     | Handle Stripe payment events      |
| `/api/purchases/check?courseSlug=` | GET | Check if user purchased a course  |
| `/api/keystatic/[...params]`| ALL     | Keystatic API handler             |

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed step-by-step guides covering:

- **Vercel** (recommended)
- **Cloudflare Pages**
- **Zeabur**

## License

Private project. All rights reserved.
