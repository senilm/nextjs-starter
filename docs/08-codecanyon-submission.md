# Module 08: CodeCanyon Submission & Compliance

Everything needed to pass CodeCanyon review on the first submission.

---

## Submission Package

Final `.zip` uploaded to CodeCanyon:

```
shipstation-codecanyon.zip
├── shipstation/                ← Full source code
│   ├── src/
│   ├── prisma/
│   ├── emails/
│   ├── content/               ← MDX blog posts
│   ├── public/
│   ├── docs/
│   ├── package.json
│   ├── pnpm-lock.yaml
│   ├── .env.example
│   ├── Dockerfile
│   ├── docker-compose.yml
│   ├── deploy.sh
│   ├── nginx.conf.example
│   ├── README.md
│   ├── CHANGELOG.md
│   └── LICENSE
├── documentation/
│   ├── documentation.pdf       ← 30+ page PDF manual
│   └── online-docs-url.txt    ← URL to online docs
└── preview-assets/             ← NOT in buyer download, for listing only
    ├── thumbnail.png           ← 590×300px
    ├── screenshots/            ← 8-12 screenshots
    └── preview-url.txt         ← Live demo URL
```

---

## Hard Requirements (Rejection If Missing)

### 1. All Source Code Included

No compiled-only files. No obfuscated code. Buyer must be able to read, modify, and extend everything.

### 2. No CDN Dependencies

All JS libraries, CSS, and fonts installed via pnpm and bundled. No external CDN URLs anywhere.

Exception: Stripe.js loaded from Stripe's domain (required by their terms).

### 3. No Inline Styles

All styling via Tailwind utilities or CSS modules. Zero `style={{ }}` attributes.

### 4. Documentation

- English, formatted as PDF
- Publicly accessible online (not behind a purchase key)
- Treats buyer as a beginner — clear explanations, visuals, step-by-step

### 5. Code Quality

- No deprecated functions or APIs
- No TODO/FIXME comments
- No commented-out code blocks
- No `console.log` in production
- Proper error handling everywhere

### 6. License Compliance

All npm packages must have compatible licenses. Verify:

```bash
npx license-checker --summary
```

- ✅ MIT, Apache 2.0, BSD, ISC, MPL 2.0
- ❌ GPL (copyleft — would require ShipStation to be GPL)

---

## PDF Manual (30+ Pages)

### Table of Contents

1. **Introduction** (2p) — What is ShipStation, tech stack overview, what's included
2. **Quick Start** (3p) — Prerequisites, `npx shipstation init`, first login, dashboard screenshot
3. **Configuration** (4p) — Every env var explained, OAuth setup with screenshots, Stripe setup, Resend setup
4. **Authentication** (3p) — Sign-up/sign-in flows, social login setup, magic link, 2FA, account deletion
5. **RBAC Guide** (4p) — How permissions work, default roles, creating custom roles with screenshots, adding new permissions
6. **Billing** (3p) — Stripe plan configuration, creating plans in Stripe Dashboard, usage enforcement, test mode
7. **Customization** (4p) — Changing branding (config file), modifying landing page, adding new features step-by-step, adding new permissions
8. **Deployment** (4p) — Vercel with screenshots, Docker self-hosted, database setup, domain + SSL
9. **Troubleshooting** (2p) — Common errors, DB connection issues, Stripe webhook debugging, env var issues
10. **Changelog** (1p) — Version history

---

## Listing Assets

### Thumbnail

590×300px. App dashboard screenshot with logo overlay. Clean, professional.

### Screenshots (8-12)

1. Landing page — hero section
2. Landing page — features section
3. Pricing page
4. Sign-in page
5. Dashboard overview
6. Projects CRUD
7. Admin — user management
8. Admin — roles & permissions matrix
9. Billing page
10. Mobile view (responsive)
11. Dark mode view
12. Email template preview

### Live Demo

Deployed on Vercel with demo accounts:
- Super Admin: `admin@demo.shipstation.dev` / `Demo@123456`
- Regular User: `user@demo.shipstation.dev` / `Demo@123456`

Reset periodically or make read-only to prevent abuse.

---

## Listing Description

Key points to include:
- Tech stack with versions (latest 2026 stack)
- Full feature list with checkmarks
- "Save 3+ months" value proposition
- Database-driven RBAC (key differentiator)
- Self-hosted auth (no per-user costs)
- 12 built-in security protections
- One-command setup
- 30-page PDF + video + inline comments
- 6 months support, regular updates

### Tags

`nextjs, react, saas, starter-kit, boilerplate, typescript, tailwind, stripe, shadcn, rbac, better-auth, prisma, admin-panel, dashboard`

---

## Pre-Submission Checklist

### Code Quality

- [ ] `pnpm typecheck` — zero errors
- [ ] `pnpm lint` — zero warnings
- [ ] `pnpm format:check` — all files formatted
- [ ] No `console.log` in production code
- [ ] No `TODO` / `FIXME` comments
- [ ] No commented-out code blocks
- [ ] No `any` types
- [ ] All files have JSDoc header comments
- [ ] No file exceeds 300 lines
- [ ] `npx license-checker --summary` — no GPL dependencies

### Functionality

- [ ] Fresh install works: `pnpm install` → `prisma migrate` → `prisma seed` → `pnpm dev`
- [ ] All auth flows: sign-up, sign-in, forgot-password, magic link, OAuth, 2FA
- [ ] RBAC: permissions enforce server-side, UI hides unauthorized actions
- [ ] Billing: upgrade, cancel, restore, portal
- [ ] Plan limits enforced on project creation
- [ ] Admin panel: all pages functional, all CRUD works
- [ ] Email sending works (dev mode at minimum)
- [ ] Blog renders MDX posts correctly
- [ ] Contact form submits and sends email
- [ ] Dark mode works on ALL pages
- [ ] `next build` completes without errors
- [ ] Marketing pages show `○ (Static)` in build output

### Compliance

- [ ] No CDN URLs for assets
- [ ] No inline styles
- [ ] All source code included
- [ ] `.env.example` has all variables documented
- [ ] No secrets in source code
- [ ] `.gitignore` excludes `.env`, `node_modules`, `.next`

### Documentation

- [ ] README.md with quick start
- [ ] PDF manual (30+ pages)
- [ ] Online documentation URL
- [ ] CHANGELOG.md
- [ ] Video walkthrough recorded

### Assets

- [ ] Thumbnail (590×300px)
- [ ] 8-12 screenshots
- [ ] Live demo deployed and working
- [ ] Demo accounts created

### Performance

- [ ] Lighthouse 95+ on marketing pages
- [ ] FCP under 1s on marketing pages
- [ ] Bundle under 200KB gzipped initial load

### Accessibility

- [ ] Heading hierarchy (h1 → h2 → h3, no skipping)
- [ ] ARIA labels on interactive elements
- [ ] Keyboard navigation works
- [ ] Focus visible on all interactive elements
- [ ] Color contrast 4.5:1 in both modes