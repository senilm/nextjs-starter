# Module 05: Landing Page & Marketing

All marketing pages are **statically generated (SSG)**. No dynamic data fetching, no `useEffect`, no client-side state on the page level. Interactive bits (toggles, accordions, mobile nav) are isolated into small client components that don't break static generation of the parent page.

---

## SSG Rules

- Every marketing page must be a **Server Component** by default. No `'use client'` on page files.
- Interactive elements (pricing toggle, FAQ accordion, mobile hamburger, dark mode toggle) are extracted into small client components and imported into the server page.
- Never use `cookies()`, `headers()`, or any dynamic function in marketing pages — these opt the page out of static generation.
- Never fetch user session or auth state at the page level. The navbar handles auth state in its own client component.
- Verify with `next build` — marketing routes should show `○ (Static)` in the build output, never `λ (Dynamic)`.

---

## File Structure

```
src/app/(marketing)/
├── layout.tsx                ← Server Component: imports Navbar + Footer
├── page.tsx                  ← Homepage (Server Component, fully static)
├── pricing/
│   └── page.tsx              ← Pricing page (Server Component)
├── blog/
│   ├── page.tsx              ← Blog list (Server Component, reads MDX at build time)
│   └── [slug]/
│       └── page.tsx          ← Blog post (Server Component, generateStaticParams)
└── contact/
    └── page.tsx              ← Contact page (Server Component, form is client component)

src/features/marketing/
├── components/
│   ├── navbar.tsx            ← Server Component shell
│   ├── navbar-auth-button.tsx ← 'use client' — checks session, shows Dashboard or Get Started
│   ├── mobile-nav.tsx        ← 'use client' — Sheet hamburger menu
│   ├── footer.tsx            ← Server Component
│   ├── hero.tsx              ← Server Component
│   ├── social-proof.tsx      ← Server Component
│   ├── features-grid.tsx     ← Server Component
│   ├── how-it-works.tsx      ← Server Component
│   ├── pricing-section.tsx   ← Server Component shell
│   ├── pricing-toggle.tsx    ← 'use client' — monthly/yearly switch
│   ├── plan-card.tsx         ← Server Component (receives price as prop)
│   ├── testimonials.tsx      ← Server Component
│   ├── faq.tsx               ← Server Component shell
│   ├── faq-accordion.tsx     ← 'use client' — Shadcn Accordion
│   ├── cta-banner.tsx        ← Server Component
│   ├── contact-form.tsx      ← 'use client' — form with RHF + Zod
│   ├── blog-card.tsx         ← Server Component
│   └── blog-post-layout.tsx  ← Server Component (TOC, metadata, MDX content)
├── actions.ts                ← submitContactForm server action
└── validations.ts            ← Contact form Zod schema
```

**Pattern:** Server Component does layout/content → imports a small `'use client'` component only for the interactive bit. The page itself stays static.

---

## Navbar

```
┌────────────────────────────────────────────────────────┐
│  [Logo]   Features  Pricing  Blog  Contact  [☀/🌙] [CTA] │
└────────────────────────────────────────────────────────┘
```

- Sticky on scroll with backdrop blur (`sticky top-0 z-50 backdrop-blur`)
- Logo + nav links are Server Component
- Auth CTA is a separate `'use client'` component (`navbar-auth-button.tsx`):
  - If authenticated: "Dashboard" button
  - If not: "Get Started" → `/sign-up`
- Dark/Light toggle is a `'use client'` component
- Mobile: hamburger → Sheet (`mobile-nav.tsx`, `'use client'`)

### Footer

```
┌────────────────────────────────────────────────────────┐
│  [Logo]          Product     Company      Legal        │
│  Brief desc      Features    About        Privacy      │
│                  Pricing     Blog         Terms        │
│                  Docs        Contact      License      │
│                                                        │
│  © 2026 AppName. All rights reserved.                  │
└────────────────────────────────────────────────────────┘
```

Server Component. All links are plain `<Link>` elements. No interactivity needed.

---

## Homepage (`/`)

All sections are Server Components unless noted. Section order:

### 1. Hero

- Headline, subtitle, two CTA buttons (primary filled + secondary outline)
- App screenshot or mockup image below
- Subtle entrance animation via `motion` (fade up) — wrap in a `'use client'` component

### 2. Social Proof Bar

- "Trusted by X developers" + stats or logo strip
- Server Component, no interactivity

### 3. Features Grid

- 6 cards in 3×2 grid (stacks to 1 column on mobile)
- Each card: Lucide icon, feature name, 1-2 sentence description
- Features: Authentication, RBAC, Stripe Billing, Admin Dashboard, Email System, Beautiful UI
- Entrance animation per card (staggered fade up) — `'use client'` wrapper

### 4. How It Works

- 3 steps with icons/illustrations
- Server Component

### 5. Pricing

- Server Component shell renders plan cards from `PLANS` config
- `pricing-toggle.tsx` (`'use client'`) handles monthly/yearly switch via `useState`
- Toggle passes billing period to plan cards as prop
- Plan cards are Server Components receiving price as prop

### 6. Testimonials

- 3 cards: quote, name, title, avatar
- Placeholder content — buyer replaces
- Server Component

### 7. FAQ

- Server Component shell passes questions array to `faq-accordion.tsx` (`'use client'`)
- 6-8 questions using Shadcn Accordion
- FAQ content defined as a const array in the page, not fetched

### 8. CTA Banner

- Final call-to-action with gradient background
- "Get Started" button → `/sign-up`
- Server Component

---

## Pricing Page (`/pricing`)

- Monthly/yearly toggle (same `pricing-toggle.tsx` client component)
- 3 plan cards with full feature lists from `PLANS` config
- Feature comparison table below (all features × all plans, check/cross marks)
- Billing FAQ section at bottom (reuse `faq-accordion.tsx`)
- Page is Server Component, toggle and accordion are client components

---

## Blog

### MDX Setup

Use `next-mdx-remote` or `@next/mdx`. Blog posts stored in `content/blog/` as `.mdx` files.

### Frontmatter

```mdx
---
title: "How to Build a SaaS in 2026"
description: "A complete guide to launching your SaaS product."
date: "2026-03-01"
author: "ShipStation Team"
image: "/blog/saas-guide.jpg"
tags: ["saas", "nextjs", "tutorial"]
---
```

### Blog List (`/blog`)

- `generateStaticParams()` reads all `.mdx` files at build time
- Card grid: title, excerpt, date, reading time (calculated from word count), cover image
- Server Component, fully static

### Blog Post (`/blog/[slug]`)

- `generateStaticParams()` generates all slugs at build time
- Title + metadata (date, reading time, author)
- Cover image
- MDX content with: code blocks (syntax highlighting via `rehype-pretty-code` or `shiki`), auto-generated anchor links, responsive images
- Table of contents generated from headings
- Server Component

---

## Contact Page (`/contact`)

- Page is Server Component
- Form is a `'use client'` component (`contact-form.tsx`)

### Form Fields

- Name (required)
- Email (required, valid format)
- Message (required, 10-1000 chars)
- Honeypot field (hidden, if filled → reject silently)

### Server Action

Location: `src/features/marketing/actions.ts`

```typescript
export async function submitContactForm(input: ContactFormInput) {
  // 1. Validate with Zod
  // 2. Check honeypot — if filled, return success silently (bot trap)
  // 3. Rate limit: 3 submissions per hour per IP
  // 4. Send email to admin via Resend (Contact Form template)
  // 5. Return success
}
```

No CAPTCHA by default. Honeypot + rate limiting is enough. CAPTCHA documented as an enhancement in the PDF manual.

---

## SEO

### Per-Page Metadata

Every marketing page exports `metadata` (Next.js Metadata API):

```typescript
export const metadata: Metadata = {
  title: 'Page Title | AppName',
  description: 'Page description for search engines.',
  openGraph: {
    title: 'Page Title',
    description: 'Page description',
    url: 'https://app.com/page',
    images: [{ url: '/og/page.png', width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image' },
  alternates: { canonical: 'https://app.com/page' },
}
```

This is static metadata — no `generateMetadata()` needed on marketing pages (except blog posts which use `generateMetadata()` with the MDX frontmatter).

### Auto-Generated

- `sitemap.xml` via `src/app/sitemap.ts`
- `robots.txt` via `src/app/robots.ts`

### JSON-LD

- Homepage: `Organization` schema (static, hardcoded in page)
- Blog posts: `BlogPosting` schema (generated from frontmatter)

### Dynamic OG Images

Use `@vercel/og` for blog posts:

```typescript
// src/app/api/og/route.tsx
import { ImageResponse } from '@vercel/og'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const title = searchParams.get('title')
  return new ImageResponse(/* JSX with title */, { width: 1200, height: 630 })
}
```

Blog post metadata references: `images: [{ url: '/api/og?title=...' }]`

---

## Design System

### Theme Tokens

Location: `src/styles/globals.css` using Tailwind CSS 4.2 `@theme`:

```css
@theme {
  --color-primary: #2563eb;
  --color-primary-foreground: #ffffff;
  --color-secondary: #f1f5f9;
  --color-accent: #8b5cf6;
  --color-background: #ffffff;
  --color-foreground: #0f172a;
  --color-muted: #64748b;
  --color-border: #e2e8f0;
  --font-sans: 'Inter', system-ui, sans-serif;
  --radius: 0.5rem;
}
```

Buyer customization: change tokens in ONE file to rebrand the entire app.

### Dark Mode

Tailwind `dark:` prefix. System preference + manual toggle stored in `localStorage` (handled by the `'use client'` toggle component, doesn't affect page static generation).

### Font

Inter via `next/font` (self-hosted, no external request — CodeCanyon compliant).

```typescript
import { Inter } from 'next/font/google'
const inter = Inter({ subsets: ['latin'] })
```

### Responsive

Test at: 375px (mobile), 768px (tablet), 1280px+ (desktop). Lighthouse 95+ on all marketing pages.