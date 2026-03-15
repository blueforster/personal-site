# NS Web - Layout & Styling Customization Guide

This guide explains how to adjust titles, banners, fonts, colors, spacing, and other visual aspects of the site.

---

## Table of Contents

1. [Site Title & Branding](#1-site-title--branding)
2. [Colors & Theme](#2-colors--theme)
3. [Fonts](#3-fonts)
4. [Hero Banner (Homepage)](#4-hero-banner-homepage)
5. [Navigation Bar](#5-navigation-bar)
6. [Footer](#6-footer)
7. [Blog Cards](#7-blog-cards)
8. [Category Icons & Colors](#8-category-icons--colors)
9. [Spacing & Layout](#9-spacing--layout)
10. [Dark Mode](#10-dark-mode)
11. [Border Radius](#11-border-radius)
12. [SEO Metadata](#12-seo-metadata)
13. [shadcn/ui Components](#13-shadcnui-components)

---

## 1. Site Title & Branding

### Site Name

The brand name "NS Web" appears in 3 places:

| Location | File | What to Change |
|---|---|---|
| Browser tab title | `src/app/layout.tsx:18-20` | `title.default` and `title.template` |
| Navbar logo | `src/components/shared/Navbar.tsx:28` | Text inside `<Link>` |
| Footer logo | `src/components/shared/Footer.tsx:36-37` | Text inside `<Link>` |

**Example** — Change site name to "My Brand":

```tsx
// src/app/layout.tsx
title: {
  default: 'My Brand — 數字分析 · AI · 書評 · 現象觀察',
  template: '%s | My Brand',
},

// src/components/shared/Navbar.tsx
<Link href="/" className="text-xl font-bold">
  My Brand
</Link>

// src/components/shared/Footer.tsx
<Link href="/" className="text-xl font-bold">
  My Brand
</Link>
```

### Site Description & SEO

File: `src/app/layout.tsx`

```tsx
export const metadata: Metadata = {
  description: '個人品牌官網，專注於數字分析、AI、書評與現象觀察。', // ← Change this
  openGraph: {
    siteName: 'NS Web',  // ← OG site name
    locale: 'zh_TW',     // ← Change to 'en_US' for English
  },
}
```

### Copyright Text

File: `src/components/shared/Footer.tsx:62`

```tsx
&copy; {new Date().getFullYear()} NS Web. All rights reserved.
// ← Change "NS Web" to your brand
```

---

## 2. Colors & Theme

All colors are defined as CSS variables using the **OKLCH** color space in `src/app/globals.css`.

### Color Palette (Light Mode)

| Variable | Default | Controls |
|---|---|---|
| `--background` | `oklch(1 0 0)` (white) | Page background |
| `--foreground` | `oklch(0.145 0 0)` (near-black) | Body text |
| `--primary` | `oklch(0.205 0 0)` (dark) | Buttons, links, accents |
| `--primary-foreground` | `oklch(0.985 0 0)` (near-white) | Text on primary buttons |
| `--secondary` | `oklch(0.97 0 0)` (light gray) | Secondary buttons/badges |
| `--muted` | `oklch(0.97 0 0)` (light gray) | Subtle backgrounds |
| `--muted-foreground` | `oklch(0.556 0 0)` (gray) | Subtitle/meta text |
| `--card` | `oklch(1 0 0)` (white) | Card backgrounds |
| `--border` | `oklch(0.922 0 0)` (light gray) | Borders and dividers |
| `--destructive` | `oklch(0.577 0.245 27.325)` (red) | Error/delete states |
| `--ring` | `oklch(0.708 0 0)` (gray) | Focus ring color |

### How to Change Colors

Edit the `:root` block in `src/app/globals.css`. OKLCH format is `oklch(lightness chroma hue)`:

- **Lightness**: 0 (black) → 1 (white)
- **Chroma**: 0 (gray) → ~0.4 (vivid)
- **Hue**: 0-360 degrees (0=red, 120=green, 240=blue, 280=purple)

**Example** — Change primary color to blue:

```css
:root {
  --primary: oklch(0.5 0.2 240);          /* blue */
  --primary-foreground: oklch(0.985 0 0);  /* white text on blue */
}
```

**Example** — Change primary to purple:

```css
:root {
  --primary: oklch(0.45 0.25 280);        /* purple */
}
```

**Example** — Warm beige background:

```css
:root {
  --background: oklch(0.98 0.01 80);  /* warm beige */
  --card: oklch(0.99 0.005 80);       /* slightly lighter card */
}
```

### Useful OKLCH Hue Values

| Color | Hue |
|---|---|
| Red | 25-30 |
| Orange | 60-70 |
| Yellow | 90-100 |
| Green | 140-160 |
| Teal | 180-190 |
| Blue | 240-260 |
| Purple | 280-300 |
| Pink | 340-350 |

> Tip: Use [oklch.com](https://oklch.com) to visually pick colors and copy OKLCH values.

---

## 3. Fonts

Fonts are loaded in `src/app/layout.tsx` using `next/font/google` for automatic optimization.

### Current Fonts

| Font | Variable | Usage |
|---|---|---|
| Geist Sans | `--font-geist-sans` | All body text (via `font-sans`) |
| Geist Mono | `--font-geist-mono` | Code blocks (via `font-mono`) |

### Change to a Different Font

**Step 1**: Import the new font in `src/app/layout.tsx`:

```tsx
// Replace Geist with your preferred font
import { Noto_Sans_TC } from 'next/font/google'

const notoSansTC = Noto_Sans_TC({
  variable: '--font-custom',
  subsets: ['latin'],
  weight: ['400', '500', '700'],
})
```

**Step 2**: Apply it to `<body>`:

```tsx
<body className={`${notoSansTC.variable} font-sans antialiased`}>
```

**Step 3**: Update `src/app/globals.css` to map the CSS variable:

```css
@theme inline {
  --font-sans: var(--font-custom);
}
```

### Popular Font Choices for Chinese + English

| Font | Import Name | Notes |
|---|---|---|
| Noto Sans TC | `Noto_Sans_TC` | Google's CJK font, clean |
| Inter | `Inter` | Popular English sans-serif |
| Geist | `Geist` | Current, modern geometric |
| Source Han Sans | N/A (self-host) | Adobe's CJK font |

---

## 4. Hero Banner (Homepage)

The hero section is in `src/app/(site)/page.tsx`, lines 97-123.

### Change Hero Title

```tsx
<h1 className="mx-auto max-w-3xl text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">
  探索數字與知識的          {/* ← Line 1 */}
  <span className="bg-gradient-to-r from-violet-500 to-blue-500 bg-clip-text text-transparent">
    無限可能                {/* ← Gradient text */}
  </span>
</h1>
```

### Change Hero Gradient Color

The gradient on "無限可能" uses Tailwind utility classes:

```tsx
// Current: violet → blue
className="bg-gradient-to-r from-violet-500 to-blue-500 ..."

// Example: pink → orange
className="bg-gradient-to-r from-pink-500 to-orange-500 ..."

// Example: emerald → cyan
className="bg-gradient-to-r from-emerald-500 to-cyan-500 ..."
```

### Change Hero Subtitle

```tsx
<p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
  透過數字分析、AI 洞察、書評筆記與現象觀察，帶你深入理解這個世界的運作方式。
</p>
```

### Change Hero Badge

```tsx
<Badge variant="secondary" className="mb-4">
  數字分析 · AI · 書評 · 現象觀察
</Badge>
```

### Change CTA Buttons

```tsx
<Button asChild size="lg">
  <Link href="/blog">
    瀏覽文章                {/* ← Primary button text */}
  </Link>
</Button>
<Button variant="outline" size="lg" asChild>
  <Link href="/about">關於我</Link>  {/* ← Secondary button text */}
</Button>
```

### Hero Background

The hero uses a gradient background:

```tsx
className="relative overflow-hidden border-b bg-gradient-to-b from-background to-muted/50"
```

Change to a solid color:

```tsx
className="relative overflow-hidden border-b bg-muted"
```

Or add a hero image — wrap content in a relative container and add:

```tsx
<div className="absolute inset-0">
  <Image src="/hero-bg.jpg" alt="" fill className="object-cover opacity-20" />
</div>
```

---

## 5. Navigation Bar

File: `src/components/shared/Navbar.tsx`

### Navigation Links

Edit the `navLinks` array (line 10):

```tsx
const navLinks = [
  { href: '/', label: '首頁' },        // ← Change labels or add/remove links
  { href: '/blog', label: '文章' },
  { href: '/courses', label: '課程' },
  { href: '/portfolio', label: '作品集' },
  { href: '/about', label: '關於' },
]
```

### Navbar Height

Default is `h-16` (64px). Change in line 27:

```tsx
<nav className="container mx-auto flex h-16 items-center justify-between px-4">
                                        ^^^^
// h-14 = 56px (compact)
// h-16 = 64px (default)
// h-20 = 80px (spacious)
```

### Navbar Background

Current: semi-transparent with backdrop blur (line 26):

```tsx
className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
```

Solid background (no blur):

```tsx
className="sticky top-0 z-50 w-full border-b bg-background"
```

### Logo Style

Currently text-only. To use an image logo:

```tsx
<Link href="/" className="flex items-center gap-2">
  <Image src="/logo.png" alt="NS Web" width={32} height={32} />
  <span className="text-xl font-bold">NS Web</span>
</Link>
```

---

## 6. Footer

File: `src/components/shared/Footer.tsx`

### Footer Links

Edit the `footerLinks` array (line 4):

```tsx
const footerLinks = [
  {
    title: '內容',           // ← Section title
    links: [
      { href: '/blog', label: '文章' },
      { href: '/courses', label: '課程' },
      { href: '/portfolio', label: '作品集' },
    ],
  },
  // ... add or remove sections
]
```

### Footer Tagline

Line 39-41:

```tsx
<p className="mt-2 text-sm text-muted-foreground">
  數字分析 · AI · 書評 · 現象觀察   {/* ← Change tagline */}
</p>
```

### Add Social Links to Footer

Add a new section with icon links:

```tsx
{
  title: '社群',
  links: [
    { href: 'https://facebook.com/yourpage', label: 'Facebook' },
    { href: 'https://instagram.com/yourpage', label: 'Instagram' },
    { href: 'https://twitter.com/yourhandle', label: 'X (Twitter)' },
  ],
},
```

---

## 7. Blog Cards

File: `src/components/blog/PostCard.tsx`

### Cover Image Aspect Ratio

Default: 16:9. Change in line 38:

```tsx
<div className="relative aspect-[16/9] overflow-hidden">
                         ^^^^^^^^^^
// aspect-[16/9]  → Wide (default)
// aspect-[4/3]   → Taller
// aspect-square  → Square (1:1)
// aspect-[3/2]   → Medium
```

### Card Hover Effect

Line 36 — image scales up on hover:

```tsx
// Current: shadow + image scale
className="group h-full overflow-hidden transition-shadow hover:shadow-lg"

// Add border highlight on hover:
className="group h-full overflow-hidden transition-all hover:shadow-lg hover:border-primary"
```

### Title Truncation

Line 52 — currently 2-line clamp:

```tsx
className="mb-2 line-clamp-2 text-lg font-semibold"
                ^^^^^^^^^^^
// line-clamp-1 → Single line
// line-clamp-2 → Two lines (default)
// line-clamp-3 → Three lines
// (remove)     → No truncation
```

### Category Label Mapping

Line 8 — maps slug to display name:

```tsx
const categoryLabels: Record<string, string> = {
  numerology: '數字分析',
  ai: 'AI',
  'book-review': '書評',
  observation: '現象觀察',
}
```

---

## 8. Category Icons & Colors

File: `src/app/(site)/page.tsx`, line 51 (`const categories`)

Each category has an icon and color pair:

```tsx
const categories = [
  {
    slug: 'numerology',
    name: '數字分析',
    description: '透過數字解讀人生密碼',
    icon: Hash,                    // ← Lucide icon component
    color: 'text-violet-500',      // ← Icon color
    bgColor: 'bg-violet-500/10',   // ← Background tint
  },
  // ...
]
```

### Change Category Colors

Replace with any Tailwind color:

```tsx
// Blues
color: 'text-blue-500',      bgColor: 'bg-blue-500/10',

// Reds
color: 'text-red-500',       bgColor: 'bg-red-500/10',

// Teal
color: 'text-teal-500',      bgColor: 'bg-teal-500/10',
```

### Change Category Icons

Import from `lucide-react`. Browse all icons at [lucide.dev/icons](https://lucide.dev/icons).

```tsx
import { Hash, Brain, BookOpen, Eye, Star, Heart, Lightbulb, Globe } from 'lucide-react'

// Then use:
icon: Star,
icon: Heart,
icon: Lightbulb,
```

---

## 9. Spacing & Layout

### Container Max Width

All sections use `container mx-auto px-4`. The container max-width is controlled by Tailwind's default:

- Default: `max-width: 80rem` (1280px)

To change, add to `src/app/globals.css`:

```css
@theme inline {
  --container-max-w: 72rem;  /* narrower: 1152px */
  /* or */
  --container-max-w: 90rem;  /* wider: 1440px */
}
```

### Section Spacing

Most sections use `py-16` (4rem / 64px vertical padding). Change per-section in their respective files:

```tsx
// Compact
className="container mx-auto px-4 py-12"

// Default
className="container mx-auto px-4 py-16"

// Spacious
className="container mx-auto px-4 py-24"
```

### Grid Columns (Blog List)

File: `src/app/(site)/page.tsx:109`

```tsx
className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
                                     ^^^^^^^^^^^^^^ ^^^^^^^^^^^^^^^
// 2 columns on tablet, 3 on desktop (default)
// Change lg:grid-cols-3 → lg:grid-cols-4 for 4 columns
// Change gap-6 → gap-4 for tighter spacing
```

---

## 10. Dark Mode

Dark mode colors are in `.dark { ... }` block of `src/app/globals.css` (lines 85-117).

### Adjust Dark Mode Background

```css
.dark {
  --background: oklch(0.145 0 0);  /* Current: very dark */
  /* Alternatives: */
  /* --background: oklch(0.18 0 0);   slightly lighter */
  /* --background: oklch(0.12 0 0);   darker / true OLED black: oklch(0 0 0) */
}
```

### Dark Mode Card Color

```css
.dark {
  --card: oklch(0.205 0 0);  /* Slightly lighter than background */
}
```

### Disable Dark Mode

In `src/app/layout.tsx`, change ThemeProvider:

```tsx
<ThemeProvider
  attribute="class"
  defaultTheme="light"     // ← Force light mode
  enableSystem={false}      // ← Disable system detection
  forcedTheme="light"       // ← Prevent toggle
>
```

---

## 11. Border Radius

Global border radius is set in `src/app/globals.css:51`:

```css
:root {
  --radius: 0.625rem;  /* 10px — default */
}
```

All component radii derive from this:

| Token | Value | Usage |
|---|---|---|
| `--radius-sm` | `--radius - 4px` | Small inputs |
| `--radius-md` | `--radius - 2px` | Buttons |
| `--radius-lg` | `--radius` | Cards |
| `--radius-xl` | `--radius + 4px` | Dialogs |

**Examples:**

```css
--radius: 0;         /* Sharp corners (no rounding) */
--radius: 0.375rem;  /* Subtle rounding (6px) */
--radius: 0.625rem;  /* Default (10px) */
--radius: 0.75rem;   /* Rounder (12px) */
--radius: 1rem;      /* Very round (16px) */
--radius: 9999px;    /* Pill shape */
```

---

## 12. SEO Metadata

### Global SEO

File: `src/app/layout.tsx`

```tsx
export const metadata: Metadata = {
  title: {
    default: 'NS Web — 數字分析 · AI · 書評 · 現象觀察',  // ← Homepage title
    template: '%s | NS Web',  // ← Other pages: "文章標題 | NS Web"
  },
  description: '個人品牌官網...',       // ← Search result description
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
}
```

The root layout also injects a **WebSite JSON-LD schema** (`websiteJsonLd` constant) on every page. This tells search engines the site name, URL, and that a search feature exists.

### Per-Page SEO

Every page has its own `metadata` export with title, description, OpenGraph, Twitter card, and canonical URL:

| Page | File | Type |
|---|---|---|
| Homepage | `src/app/(site)/page.tsx` | Static `metadata` export |
| Blog list | `src/app/(site)/blog/page.tsx` | Static `metadata` export |
| Blog post | `src/app/(site)/blog/[slug]/page.tsx` | Dynamic `generateMetadata()` |
| About | `src/app/(site)/about/page.tsx` | Static `metadata` export |
| Courses list | `src/app/(site)/courses/page.tsx` | Static `metadata` export |
| Course detail | `src/app/(site)/courses/[slug]/page.tsx` | Dynamic `generateMetadata()` |
| Portfolio | `src/app/(site)/portfolio/page.tsx` | Static `metadata` export |

**Example — change homepage SEO** (`src/app/(site)/page.tsx`):

```tsx
export const metadata: Metadata = {
  title: { absolute: 'My Brand — 副標題' },
  description: '網站描述...',
  openGraph: { title: '...', description: '...', url: siteUrl },
  twitter: { card: 'summary_large_image', title: '...' },
  alternates: { canonical: siteUrl },
}
```

**Example — change a static page SEO** (`about/page.tsx`, `blog/page.tsx`, etc.):

```tsx
export const metadata: Metadata = {
  title: '關於我',
  description: '...',
  openGraph: { title: '關於我 | NS Web', description: '...', url: `${siteUrl}/about` },
  alternates: { canonical: `${siteUrl}/about` },
}
```

### Article JSON-LD

Blog posts (`src/app/(site)/blog/[slug]/page.tsx`) output an `Article` JSON-LD schema with `headline`, `description`, `image`, `datePublished`, `dateModified`, `author`, and `publisher` fields. Edit the `jsonLd` object in that file to add more fields.

### OG Image

Dynamic OG images are generated at `/api/og?title=...&category=...`. Customize the OG image template in `src/app/api/og/route.tsx`.

Every page that has an OG image (homepage, all blog posts, all course pages) uses this endpoint as a fallback when no custom image is set in the CMS.

---

## 13. shadcn/ui Components

Configuration is in `components.json`:

```json
{
  "style": "new-york",          // Visual style: "new-york" or "default"
  "tailwind": {
    "baseColor": "neutral",     // Color palette: "neutral", "slate", "zinc", "gray", "stone"
    "cssVariables": true
  },
  "iconLibrary": "lucide"       // Icon library: "lucide" or "radix-icons"
}
```

### Change Base Color Palette

Changing `baseColor` affects all neutral/gray tones. After changing, re-add components:

```bash
# Option: regenerate all components with new base color
npx shadcn@latest add button card badge --overwrite
```

Available base colors: `slate` (cool), `gray` (neutral), `zinc` (modern), `neutral` (default), `stone` (warm).

### Customize Individual Components

All shadcn/ui components live in `src/components/ui/`. Edit them directly:

```
src/components/ui/
├── button.tsx        # Button variants and sizes
├── card.tsx          # Card container
├── badge.tsx         # Category/status badges
├── input.tsx         # Form inputs
├── separator.tsx     # Horizontal/vertical dividers
├── dialog.tsx        # Modal dialogs
├── sheet.tsx         # Mobile slide-out panel
└── ...
```

---

## Quick Reference: Common Changes

| I want to... | File | What to edit |
|---|---|---|
| Change site name | `layout.tsx`, `Navbar.tsx`, `Footer.tsx` | "NS Web" text |
| Change theme colors | `globals.css` | `:root` and `.dark` CSS variables |
| Change font | `layout.tsx` + `globals.css` | Font import + `--font-sans` variable |
| Edit hero banner | `(site)/page.tsx` | Hero section (lines 65-91) |
| Edit nav links | `Navbar.tsx` | `navLinks` array |
| Edit footer links | `Footer.tsx` | `footerLinks` array |
| Change border radius | `globals.css` | `--radius` variable |
| Change blog card style | `PostCard.tsx` | Aspect ratio, hover effects, truncation |
| Disable dark mode | `layout.tsx` | ThemeProvider props |
| Change category colors | `(site)/page.tsx` | `categories` array |
| Edit global SEO (title template, site name) | `layout.tsx` | `metadata` export |
| Edit homepage SEO | `(site)/page.tsx` | `metadata` export |
| Edit other page SEO | respective `page.tsx` | `metadata` export |
