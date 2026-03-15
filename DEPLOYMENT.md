# NS Web - Deployment Guide

## Project Info

- **Framework**: Next.js 16 (App Router)
- **Runtime**: Node.js 18+
- **CMS**: Keystatic (local Git-based)
- **Database**: PlanetScale MySQL via Prisma
- **Build Command**: `npm run build`
- **Start Command**: `npm start`
- **Output**: `.next/` (server-side rendered, not static export)

---

## Files to Upload (Git Repository)

Push **all files** to your Git repository. The `.gitignore` already excludes:

| Excluded (DO NOT upload)        | Reason              |
| ------------------------------- | ------------------- |
| `node_modules/`                 | Install via npm     |
| `.next/`                        | Build output        |
| `.env` / `.env.local`           | Secrets             |
| `*.tsbuildinfo`                 | TS cache            |
| `next-env.d.ts`                 | Auto-generated      |
| `.vercel/`                      | Vercel CLI cache    |

### Required Files Checklist

```
personal-site/
├── prisma/
│   ├── schema.prisma              # DB schema
│   └── prisma.config.ts           # Prisma config
├── public/                        # Static assets
├── src/
│   ├── app/                       # All pages & API routes
│   │   ├── (cms)/                 # Keystatic CMS admin
│   │   ├── (site)/                # Public site pages
│   │   │   └── portfolio/
│   │   │       ├── page.tsx           # Server component (metadata + data fetch)
│   │   │       └── PortfolioClient.tsx # Client component (filter/lightbox)
│   │   ├── api/                   # API routes
│   │   ├── layout.tsx             # Root layout
│   │   ├── globals.css            # Global styles
│   │   ├── robots.ts              # SEO
│   │   ├── sitemap.ts             # SEO
│   │   └── favicon.ico
│   ├── components/                # All components
│   │   ├── blog/
│   │   ├── courses/
│   │   ├── portfolio/
│   │   ├── shared/
│   │   └── ui/                    # shadcn/ui components
│   ├── lib/                       # Utilities & services
│   │   ├── auth.ts
│   │   ├── cloudinary.ts
│   │   ├── keystatic.ts
│   │   ├── meta-api.ts
│   │   ├── prisma.ts
│   │   ├── search.ts
│   │   ├── stripe.ts
│   │   ├── substack.ts
│   │   └── utils.ts
│   └── types/
│       ├── index.ts
│       └── next-auth.d.ts
├── keystatic.config.ts            # CMS config
├── next.config.ts
├── package.json
├── package-lock.json              # Lock file (required)
├── tsconfig.json
├── postcss.config.mjs
├── eslint.config.mjs
├── components.json                # shadcn/ui config
├── vercel.json                    # Vercel-specific headers
├── .gitignore
└── .env.example                   # Reference for env vars
```

---

## Environment Variables

Set these in your platform's dashboard (Settings > Environment Variables):

| Variable                    | Required | Description                        |
| --------------------------- | -------- | ---------------------------------- |
| `DATABASE_URL`              | Yes      | PlanetScale MySQL connection URL   |
| `NEXTAUTH_SECRET`           | Yes      | Random string for session signing  |
| `NEXTAUTH_URL`              | Yes      | Full site URL (e.g. https://...)   |
| `ADMIN_EMAIL`               | Yes      | Admin email for role assignment    |
| `GOOGLE_CLIENT_ID`          | Yes      | Google OAuth client ID (Cloud Console) |
| `GOOGLE_CLIENT_SECRET`      | Yes      | Google OAuth client secret         |
| `KEYSTATIC_GITHUB_CLIENT_ID` | Yes     | Keystatic GitHub OAuth App client ID |
| `KEYSTATIC_GITHUB_CLIENT_SECRET` | Yes | Keystatic GitHub OAuth App client secret |
| `KEYSTATIC_SECRET`          | Yes      | Random string for Keystatic session signing |
| `GITHUB_REPO_OWNER`         | Yes      | GitHub username or org (e.g. `yourname`) |
| `GITHUB_REPO_NAME`          | Yes      | GitHub repo name (e.g. `personal-site`) |
| `NEXT_PUBLIC_SITE_URL`      | Yes      | Public site URL (no trailing /)    |
| `META_ACCESS_TOKEN`         | No       | Meta Graph API token               |
| `META_PAGE_ID`              | No       | Facebook Page ID                   |
| `META_IG_USER_ID`           | No       | Instagram Business User ID         |
| `CLOUDINARY_CLOUD_NAME`     | No       | Cloudinary cloud name              |
| `CLOUDINARY_API_KEY`        | No       | Cloudinary API key                 |
| `CLOUDINARY_API_SECRET`     | No       | Cloudinary API secret              |
| `CONVERTKIT_API_KEY`        | No       | ConvertKit newsletter API key      |
| `CONVERTKIT_FORM_ID`        | No       | ConvertKit form ID                 |
| `CRON_SECRET`               | No       | Cron job auth token                |
| `STRIPE_SECRET_KEY`         | Yes*     | Stripe secret key (sk_test_ or sk_live_) |
| `STRIPE_WEBHOOK_SECRET`     | Yes*     | Stripe webhook signing secret (whsec_)   |
| `SUBSTACK_API_KEY`          | No       | Substack session token             |
| `SUBSTACK_PUBLICATION_URL`  | No       | Substack publication base URL      |

\* Required only if paid courses are enabled.

Generate `NEXTAUTH_SECRET` and `KEYSTATIC_SECRET` (separate values):
```bash
openssl rand -base64 32
```

### Keystatic GitHub OAuth App Setup

Keystatic uses a **separate** GitHub OAuth App (distinct from any existing GitHub login) to allow the CMS to commit content to your repo.

1. Go to [github.com/settings/applications/new](https://github.com/settings/applications/new)
2. Fill in:
   - **Application name**: `My Site CMS` (anything)
   - **Homepage URL**: `https://YOUR_DOMAIN`
   - **Authorization callback URL**: `https://YOUR_DOMAIN/api/keystatic/github/oauth/callback`
3. Click **Register application**
4. Copy **Client ID** → `KEYSTATIC_GITHUB_CLIENT_ID`
5. Click **Generate a new client secret** → `KEYSTATIC_GITHUB_CLIENT_SECRET`
6. Set `KEYSTATIC_SECRET` to a new random string (`openssl rand -base64 32`)
7. Set `GITHUB_REPO_OWNER` to your GitHub username
8. Set `GITHUB_REPO_NAME` to the repository name

> When you first visit `/keystatic` after deploying, you will be prompted to authorise the GitHub App. This grants Keystatic permission to read/write files in your repo on your behalf.

---

## Option A: Deploy to Vercel (Recommended)

### Steps

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USER/personal-site.git
   git push -u origin main
   ```

2. **Import on Vercel**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Select your GitHub repo
   - Framework: **Next.js** (auto-detected)
   - Build Command: `npm run build` (default)
   - Output Directory: leave empty (default `.next`)

3. **Set Environment Variables**
   - In Vercel dashboard > Project Settings > Environment Variables
   - Add all required variables from the table above

4. **Set up Database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```
   Or run via Vercel CLI: `vercel env pull && npx prisma db push`

5. **Set up Stripe Webhook** (if using paid courses)
   - In Stripe Dashboard > Developers > Webhooks
   - Add endpoint: `https://YOUR_DOMAIN/api/stripe/webhook`
   - Select event: `checkout.session.completed`
   - Copy signing secret to `STRIPE_WEBHOOK_SECRET` env var
   - Enable Google Pay in Stripe Dashboard: Settings > Payment methods > Google Pay
   - For local dev: `stripe listen --forward-to localhost:3000/api/stripe/webhook`

6. **Deploy**
   - Vercel auto-deploys on every push to `main`
   - Preview deploys on pull requests

### Vercel-Specific Notes
- `vercel.json` is already configured (region: `hnd1`, security headers)
- `@vercel/og` is used for OG image generation (works natively on Vercel)
- Cron jobs: set up in Vercel dashboard (Cron > `/api/schedule/trigger`)

---

## Option B: Deploy to Cloudflare Pages

### Prerequisites
- Cloudflare account
- `@cloudflare/next-on-pages` adapter

### Steps

1. **Install adapter**
   ```bash
   npm install -D @cloudflare/next-on-pages
   ```

2. **Update `next.config.ts`**
   ```ts
   import type { NextConfig } from 'next'

   const nextConfig: NextConfig = {
     images: {
       remotePatterns: [
         { protocol: 'https', hostname: 'res.cloudinary.com' },
       ],
     },
   }

   export default nextConfig
   ```

3. **Push to GitHub** (same as Vercel step 1)

4. **Create Cloudflare Pages project**
   - Go to Cloudflare Dashboard > Pages > Create a project
   - Connect your GitHub repo
   - Build settings:
     - **Build command**: `npx @cloudflare/next-on-pages`
     - **Build output directory**: `.vercel/output/static`
     - **Node.js version**: `18` (or higher)

5. **Set Environment Variables**
   - In Pages project > Settings > Environment variables
   - Add all required variables
   - Set for both **Production** and **Preview**

6. **Database Setup**
   - Run `npx prisma db push` locally with `DATABASE_URL` set
   - Or use Cloudflare D1 (requires schema migration from MySQL)

### Cloudflare Limitations
- `@vercel/og` may not work; replace with Cloudflare Workers-compatible OG generation if needed
- Edge runtime only; some Node.js APIs (like `crypto`) may need polyfills
- Keystatic admin (`/keystatic`) requires server-side API routes; verify compatibility
- No built-in cron; use Cloudflare Workers Cron Triggers for `/api/schedule/trigger`

---

## Option C: Deploy to Zeabur

### Steps

1. **Push to GitHub** (same as Vercel step 1)

2. **Create Zeabur project**
   - Go to [zeabur.com](https://zeabur.com) > Create Project
   - Select region (recommend **Asia East** for Taiwan)
   - Click **Deploy Service** > **Git** > select your repo

3. **Configure Build**
   - Zeabur auto-detects Next.js
   - Build command: `npm run build` (auto-detected)
   - Start command: `npm start` (auto-detected)
   - No extra config needed

4. **Set Environment Variables**
   - In Zeabur project > Service > Variables
   - Add all required variables from the table above

5. **Set up Database**
   - Option 1: Use Zeabur's built-in MySQL service
     - Add MySQL service in the same project
     - Copy the connection URL to `DATABASE_URL`
   - Option 2: Use external PlanetScale
     - Set `DATABASE_URL` to your PlanetScale connection string

6. **Run Prisma migration**
   ```bash
   # Locally with DATABASE_URL pointing to production DB
   npx prisma db push
   ```

7. **Bind Domain**
   - In Service > Networking > Custom Domain
   - Add your domain and configure DNS

### Zeabur Notes
- Supports Node.js runtime natively (no edge limitations)
- `@vercel/og` works since it runs on Node.js
- Cron jobs: use Zeabur's built-in Cron service or external service (e.g. cron-job.org)
- Free tier available for hobby projects

---

## Post-Deployment Checklist

- [ ] Site loads at production URL
- [ ] `/keystatic` CMS admin accessible (login with Google then GitHub)
- [ ] Unauthenticated visit to `/keystatic` redirects to Google login (middleware working)
- [ ] Unauthenticated visit to `/admin` redirects to Google login (middleware working)
- [ ] Blog posts render correctly — article body shows formatted text with headings, paragraphs, and code blocks (not plain text)
- [ ] Portfolio page shows published items from CMS (not empty)
- [ ] Search (Cmd+K) works
- [ ] Share buttons open correct URLs
- [ ] Dark/light mode toggle works
- [ ] Comments and likes functional (database connected)
- [ ] OG images generate correctly (check with [opengraph.xyz](https://opengraph.xyz))
- [ ] `robots.txt` and `sitemap.xml` accessible
- [ ] Mobile responsive layout correct (test at 375px width)
- [ ] Set up custom domain and HTTPS
- [ ] Stripe webhook endpoint configured and receiving events (if using paid courses)
- [ ] Test purchase flow end-to-end with Stripe test mode
- [ ] Free course chapters viewable without login
- [ ] Paid course chapters locked for non-purchasers

---

## Quick Reference Commands

```bash
# Local development
npm run dev

# Build check
npm run build

# Type check
npx tsc --noEmit

# Lint
npm run lint

# Database
npx prisma generate    # Generate client
npx prisma db push     # Sync schema to DB
npx prisma studio      # Open DB GUI
```
