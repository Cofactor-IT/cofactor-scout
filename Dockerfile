# ========================================
# Stage 1: Install dependencies
# ========================================
FROM node:20-alpine AS deps
WORKDIR /app

# Install dependencies for Prisma (openssl and libc6-compat for ARM64)
RUN apk add --no-cache libc6-compat openssl

COPY package.json package-lock.json* ./
RUN npm ci --legacy-peer-deps

# ========================================
# Stage 2: Build the application
# ========================================
FROM node:20-alpine AS builder
WORKDIR /app

# Install openssl for Prisma generate
RUN apk add --no-cache openssl

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client with ARM64 binary targets
RUN npx prisma generate

# Build Next.js
# Build Next.js
ENV NEXT_TELEMETRY_DISABLED=1
ENV DATABASE_URL="postgresql://cofactor:password@db:5432/cofactor"

# Accept Sentry build arguments
ARG NEXT_PUBLIC_SENTRY_DSN
ARG SENTRY_ORG
ARG SENTRY_PROJECT
ARG SENTRY_AUTH_TOKEN

ENV NEXT_PUBLIC_SENTRY_DSN=$NEXT_PUBLIC_SENTRY_DSN
ENV SENTRY_ORG=$SENTRY_ORG
ENV SENTRY_PROJECT=$SENTRY_PROJECT
ENV SENTRY_AUTH_TOKEN=$SENTRY_AUTH_TOKEN
RUN npm run build

# ========================================
# Stage 3: Production runner
# ========================================
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Install openssl for Prisma runtime on ARM64
RUN apk add --no-cache openssl postgresql-client && npm install -g pm2

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built assets (using standalone output for minimal image size)
# Copy built assets (using standalone output for minimal image size)
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/prisma ./node_modules/prisma

# Ensure uploads directory exists and is writable
RUN mkdir -p /app/public/uploads && chown -R nextjs:nodejs /app/public/uploads

# Copy entrypoint script and set permissions (before switching user)
COPY --from=builder /app/docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh && chown nextjs:nodejs /docker-entrypoint.sh

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["pm2-runtime", "start", "server.js", "-i", "3", "--max-memory-restart", "4G"]
