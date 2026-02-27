# Deployment Guide

**Audience:** Developers, DevOps  
**Last Updated:** 2026-02-26

## Production Deployment (Vercel + Supabase)

### Prerequisites
- Vercel account
- Supabase account
- GitHub repository

### Step 1: Set Up Supabase Database

1. Create Supabase project at [supabase.com](https://supabase.com)
2. Go to Settings → Database
3. Copy connection string
4. Note both URLs:
   - Connection pooler URL (for `DATABASE_URL`)
   - Direct connection URL (for `DIRECT_URL`)

### Step 2: Deploy to Vercel

**Option A: Vercel Dashboard**
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import GitHub repository
4. Configure environment variables (see below)
5. Deploy

**Option B: Vercel CLI**
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Set environment variables
vercel env add DATABASE_URL
vercel env add NEXTAUTH_SECRET
# ... add all required variables

# Deploy to production
vercel --prod
```

### Step 3: Configure Environment Variables

In Vercel dashboard, add these environment variables:

**Required:**
```
DATABASE_URL=postgresql://postgres:[password]@[host]:5432/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres:[password]@[host]:5432/postgres
NEXTAUTH_SECRET=[generate with: openssl rand -base64 32]
NEXTAUTH_URL=https://scout.cofactor.world
```

**Optional (Email):**
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=Cofactor Scout <no-reply@cofactor.world>
```

**Optional (Admin):**
```
ADMIN_EMAIL=admin@cofactor.world
ADMIN_PASSWORD=secure-password
```

**Optional (Monitoring):**
```
NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
SENTRY_ORG=your-org
SENTRY_PROJECT=cofactor-scout
SENTRY_AUTH_TOKEN=your-token
```

### Step 4: Push Database Schema

```bash
# Use production environment file
npx dotenv -e .env.production -- npx prisma db push

# Or set DATABASE_URL directly
DATABASE_URL="your-production-url" npx prisma db push
```

### Step 5: Verify Deployment

1. Visit your production URL
2. Test sign up flow
3. Test email verification
4. Test submission flow
5. Check Sentry for errors

## Custom Domain Setup

### Step 1: Add Domain in Vercel

1. Go to Project Settings → Domains
2. Add your domain: `scout.cofactor.world`
3. Follow DNS configuration instructions

### Step 2: Configure DNS

Add these records to your DNS provider:

**A Record:**
```
Type: A
Name: scout
Value: 76.76.21.21
```

**CNAME Record (alternative):**
```
Type: CNAME
Name: scout
Value: cname.vercel-dns.com
```

### Step 3: Update NEXTAUTH_URL

```
NEXTAUTH_URL=https://scout.cofactor.world
```

## Database Migrations

### Pushing Schema Changes

**⚠️ IMPORTANT:** Always use `npx prisma db push` for production.

```bash
# With production env file
npx dotenv -e .env.production -- npx prisma db push

# Or with direct URL
DATABASE_URL="your-production-url" npx prisma db push
```

**Why `db push` instead of `migrate`:**
- Safer for production (no automatic migrations)
- Requires manual confirmation
- Shows exactly what will change
- Can be rolled back easily

### Creating Migrations (Optional)

If you want migration history:

```bash
# Create migration
npx prisma migrate dev --name add_new_field

# Deploy to production
npx dotenv -e .env.production -- npx prisma migrate deploy
```

## Monitoring

### Vercel Analytics

Automatically enabled for all deployments:
- Page views
- Performance metrics
- Error rates

### Sentry Error Tracking

1. Create Sentry project
2. Add DSN to environment variables
3. Errors automatically tracked

### Database Monitoring

Supabase dashboard shows:
- Database size
- Connection count
- Query performance
- Error logs

## Backup Strategy

### Supabase Automatic Backups

**Free Tier:**
- Daily backups
- 7-day retention

**Pro Tier:**
- Daily backups
- 7-day retention
- Point-in-time recovery

### Manual Backup

```bash
# Export database
pg_dump "your-database-url" > backup.sql

# Restore database
psql "your-database-url" < backup.sql
```

## Rollback Procedure

### Vercel Deployment Rollback

1. Go to Vercel dashboard
2. Click "Deployments"
3. Find previous working deployment
4. Click "..." → "Promote to Production"

### Database Rollback

1. Restore from Supabase backup
2. Or use manual backup
3. Verify data integrity

## Performance Optimization

### Vercel Edge Functions

Already optimized for:
- Global CDN
- Edge caching
- Automatic compression

### Database Connection Pooling

Supabase provides:
- PgBouncer connection pooling
- Automatic connection management
- No configuration needed

### Image Optimization

Next.js automatically optimizes images:
- WebP format
- Responsive sizes
- Lazy loading

## Security Checklist

- [ ] NEXTAUTH_SECRET is strong random string
- [ ] Database password is strong
- [ ] SMTP credentials are app-specific passwords
- [ ] Environment variables are set in Vercel
- [ ] Custom domain has SSL (automatic with Vercel)
- [ ] Sentry is configured for error tracking
- [ ] Admin account has strong password

## Post-Deployment Checklist

- [ ] Sign up works
- [ ] Email verification works
- [ ] Sign in works
- [ ] Password reset works
- [ ] Submission flow works
- [ ] Scout application works
- [ ] Dashboard loads correctly
- [ ] Mobile responsive
- [ ] No console errors
- [ ] Sentry receiving errors
- [ ] Custom domain works
- [ ] SSL certificate active

## Troubleshooting

See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for common deployment issues.

## Cost Estimate

**Vercel:**
- Hobby: Free (personal projects)
- Pro: $20/month (commercial projects)

**Supabase:**
- Free: $0/month (500MB database)
- Pro: $25/month (8GB database)

**Total:** $0-45/month depending on tier

## Support

- Vercel: [vercel.com/support](https://vercel.com/support)
- Supabase: [supabase.com/support](https://supabase.com/support)
- Cofactor: support@cofactor.world
