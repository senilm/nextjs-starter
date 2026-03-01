# Module 07: Deployment & DevOps

Two deployment methods: Vercel (recommended) and Docker (self-hosted).

---

## Vercel (Recommended)

### One-Click Deploy

README includes a Deploy to Vercel button:

```markdown
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=...&env=DATABASE_URL,BETTER_AUTH_SECRET,BETTER_AUTH_URL,STRIPE_SECRET_KEY,STRIPE_WEBHOOK_SECRET,NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,RESEND_API_KEY,EMAIL_FROM,NEXT_PUBLIC_APP_URL,NEXT_PUBLIC_APP_NAME)
```

### Database

Recommended: Neon (free tier) or Supabase. Set `DATABASE_URL` env var in Vercel dashboard.

### Post-Deploy Steps

1. Set all env vars in Vercel dashboard (copy from `.env.example`)
2. Set `BETTER_AUTH_URL` and `NEXT_PUBLIC_APP_URL` to the Vercel production domain
3. Run `prisma migrate deploy` via Vercel CLI or build step
4. Run seed script for initial data
5. Create Stripe webhook pointing to `https://yourdomain.com/api/auth/stripe/webhook`
6. Verify: sign in with seed credentials, test auth flows, test Stripe in test mode

### Build Settings

- Build command: `pnpm build` (default)
- Output directory: `.next` (default)
- Install command: `pnpm install`
- Node.js version: 22.x

---

## Docker (Self-Hosted)

### next.config.ts

Standalone output must be enabled:

```typescript
const nextConfig = {
  output: 'standalone',
}
```

### Dockerfile

```dockerfile
# Stage 1: Dependencies
FROM node:22-alpine AS deps
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Stage 2: Build
FROM node:22-alpine AS builder
WORKDIR /app
RUN corepack enable
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

# Stage 3: Production (~150MB)
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
```

Multi-stage build. Final image ~150MB. Non-root user for security.

### docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - '3000:3000'
    env_file:
      - .env
    depends_on:
      db:
        condition: service_healthy
    restart: unless-stopped

  db:
    image: postgres:16-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      POSTGRES_USER: shipstation
      POSTGRES_PASSWORD: ${DB_PASSWORD:-changeme}
      POSTGRES_DB: shipstation
    ports:
      - '5432:5432'
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U shipstation']
      interval: 5s
      timeout: 5s
      retries: 5
    restart: unless-stopped

volumes:
  postgres_data:
```

### Deploy Script (`deploy.sh`)

```bash
#!/bin/bash
set -e

echo "🚀 Deploying ShipStation..."

git pull origin main

docker compose down
docker compose build --no-cache
docker compose up -d

# Wait for DB to be healthy
echo "⏳ Waiting for database..."
sleep 5

# Run migrations
docker compose exec app npx prisma migrate deploy

# Seed (first time only — uncomment if needed)
# docker compose exec app npx prisma db seed

echo "✅ Deployed successfully!"
echo "🌐 Access at: http://localhost:3000"
```

### Nginx Reverse Proxy

Sample config for custom domain + SSL:

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

SSL via Let's Encrypt: `certbot --nginx -d yourdomain.com`

---

## Files Checklist

- [ ] `Dockerfile` — multi-stage, ~150MB final, non-root user
- [ ] `docker-compose.yml` — app + PostgreSQL with healthcheck
- [ ] `deploy.sh` — pull, build, up, migrate
- [ ] `nginx.conf.example` — reverse proxy sample
- [ ] `next.config.ts` — `output: 'standalone'`
- [ ] `.env.example` — all variables documented
- [ ] `.dockerignore` — node_modules, .next, .env, .git
- [ ] Vercel deploy button in README
- [ ] Stripe webhook URL documented for both Vercel and Docker