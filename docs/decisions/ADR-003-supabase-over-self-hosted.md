# ADR-003: Supabase Over Self-Hosted PostgreSQL

**Status:** Accepted  
**Date:** February 2026  
**Deciders:** Development Team

## Context

Cofactor Scout requires a PostgreSQL database for storing users, research submissions, and application data. We needed to decide between:

1. **Supabase** - Managed PostgreSQL with additional features
2. **Self-hosted PostgreSQL** - Run our own database server
3. **AWS RDS** - Amazon's managed PostgreSQL
4. **Neon** - Serverless PostgreSQL

## Decision

**Use Supabase for production database.**

Allow local PostgreSQL or Docker for development.

## Reasoning

### Why Supabase?

1. **Free Tier**
   - 500MB database storage
   - Unlimited API requests
   - 50,000 monthly active users
   - Perfect for MVP and early growth

2. **Managed Service**
   - Automatic backups (daily)
   - Point-in-time recovery
   - Automatic updates
   - No server maintenance

3. **Performance**
   - Connection pooling built-in
   - Global CDN
   - Read replicas available
   - Fast query performance

4. **Developer Experience**
   - Web-based SQL editor
   - Table editor GUI
   - Real-time database changes (future feature)
   - Excellent documentation

5. **Security**
   - SSL connections by default
   - Row-level security (RLS) available
   - Automatic security patches
   - SOC 2 compliant

6. **Scalability**
   - Easy to upgrade plan
   - Vertical scaling (more CPU/RAM)
   - Read replicas for horizontal scaling
   - No downtime upgrades

### Why Not Self-Hosted?

**Cons of Self-Hosting:**
- Server maintenance burden
- Manual backups required
- Security updates manual
- No automatic failover
- Higher operational cost (time)
- Need DevOps expertise

**When Self-Hosting Makes Sense:**
- Very large scale (millions of users)
- Specific compliance requirements
- Cost optimization at scale
- Custom PostgreSQL extensions

## Implementation

### Connection String Format

```env
# Supabase connection string
DATABASE_URL="postgresql://postgres:[password]@[host]:5432/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres:[password]@[host]:5432/postgres"
```

**Two URLs Required:**
- `DATABASE_URL` - Uses connection pooler (PgBouncer) for serverless
- `DIRECT_URL` - Direct connection for migrations

### Prisma Configuration

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

### Development Setup

**Option 1: Supabase (Recommended)**
- Use same database for dev and prod
- Separate projects for dev/staging/prod
- Consistent environment

**Option 2: Local PostgreSQL**
```bash
# Install PostgreSQL locally
brew install postgresql@15  # macOS
sudo apt install postgresql-15  # Ubuntu

# Create database
createdb cofactor_scout

# Use in .env.local
DATABASE_URL="postgresql://localhost:5432/cofactor_scout"
```

**Option 3: Docker**
```bash
# Start PostgreSQL container
docker-compose up -d db

# Use in .env.local
DATABASE_URL="postgresql://localhost:5432/cofactor_scout"
```

## Consequences

### Positive

- **Zero Maintenance:** No server management, backups, or updates
- **Fast Setup:** Database ready in 2 minutes
- **Free for MVP:** No cost until significant growth
- **Reliable:** 99.9% uptime SLA
- **Secure:** SSL, automatic patches, SOC 2 compliant
- **Scalable:** Easy to upgrade as we grow

### Negative

- **Vendor Lock-in:** Migrating away requires effort
- **Cost at Scale:** Can become expensive at very large scale
- **Limited Control:** Can't install custom PostgreSQL extensions
- **Network Latency:** Slight latency vs local database

### Neutral

- **Connection Pooling:** Required for serverless (Vercel)
- **Backup Strategy:** Automatic daily backups, can export manually
- **Monitoring:** Built-in dashboard, can add external monitoring

## Cost Analysis

### Supabase Pricing

**Free Tier:**
- 500MB database
- 1GB file storage
- 50,000 monthly active users
- 2GB bandwidth
- **Cost: $0/month**

**Pro Tier ($25/month):**
- 8GB database
- 100GB file storage
- 100,000 monthly active users
- 50GB bandwidth
- Daily backups for 7 days
- Point-in-time recovery

**Team Tier ($599/month):**
- 100GB database
- 200GB file storage
- Unlimited users
- 250GB bandwidth
- Daily backups for 14 days

### Self-Hosted Cost Estimate

**AWS EC2 (t3.small):**
- Instance: $15/month
- Storage (50GB): $5/month
- Backups (S3): $2/month
- **Total: $22/month**

**Plus:**
- DevOps time: 5-10 hours/month
- Monitoring setup
- Backup automation
- Security hardening

**Conclusion:** Supabase is cheaper when factoring in time.

## Alternatives Considered

### 1. AWS RDS

**Pros:**
- Fully managed
- Excellent reliability
- Deep AWS integration
- Automatic backups

**Cons:**
- More expensive ($15-30/month minimum)
- More complex setup
- Requires AWS knowledge
- No free tier

**Why Rejected:** More expensive, more complex, no free tier

### 2. Neon

**Pros:**
- Serverless PostgreSQL
- Generous free tier
- Instant branching
- Pay-per-use

**Cons:**
- Newer service (less proven)
- Limited features vs Supabase
- Smaller community
- Uncertain long-term viability

**Why Rejected:** Less mature, smaller ecosystem

### 3. PlanetScale

**Pros:**
- Serverless MySQL
- Excellent branching
- Great DX

**Cons:**
- MySQL not PostgreSQL
- Prisma limitations with MySQL
- No foreign keys
- Different SQL dialect

**Why Rejected:** We need PostgreSQL for Prisma features

### 4. Self-Hosted on Oracle Cloud Free Tier

**Pros:**
- Truly free forever
- 4 ARM cores
- 24GB RAM
- 200GB storage

**Cons:**
- Manual setup and maintenance
- No automatic backups
- Security responsibility
- DevOps time required

**Why Rejected:** Too much operational burden for MVP

## Migration Strategy

### If We Need to Migrate Away

**To Self-Hosted:**
1. Export database with `pg_dump`
2. Set up PostgreSQL server
3. Import with `pg_restore`
4. Update connection string
5. Test thoroughly

**To AWS RDS:**
1. Create RDS instance
2. Use Supabase export
3. Import to RDS
4. Update connection string
5. Verify data integrity

**Estimated Effort:** 4-8 hours

## Monitoring and Alerts

### Supabase Dashboard
- Database size
- Connection count
- Query performance
- Error logs

### External Monitoring (Future)
- [ ] Sentry for application errors
- [ ] Uptime monitoring (UptimeRobot)
- [ ] Performance monitoring (New Relic)
- [ ] Cost alerts (Supabase)

## Security Considerations

### Implemented
- SSL connections enforced
- Strong password for database user
- Connection string in environment variables
- No direct database access from client
- All queries through Prisma ORM

### Future Enhancements
- [ ] Row-level security (RLS) policies
- [ ] Read-only replicas for analytics
- [ ] IP allowlist for database access
- [ ] Audit logging

## Review

This decision will be reviewed when:
- We exceed free tier limits
- We need features Supabase doesn't provide
- Cost becomes significant concern
- We have dedicated DevOps resources

## References

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Pricing](https://supabase.com/pricing)
- [Prisma with Supabase](https://www.prisma.io/docs/guides/database/supabase)
- [PostgreSQL Connection Pooling](https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pooler)
- [.env.example](../../.env.example) - Configuration
