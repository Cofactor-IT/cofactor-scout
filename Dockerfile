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
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ========================================
# Stage 3: Production runner
# ========================================
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Install openssl for Prisma runtime on ARM64
RUN apk add --no-cache openssl postgresql-client

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built assets (using standalone output for minimal image size)
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma

# Copy entrypoint script and set permissions (before switching user)
COPY --from=builder /app/docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh && chown nextjs:nodejs /docker-entrypoint.sh

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["node", "server.js"]
