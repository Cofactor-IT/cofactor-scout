# Troubleshooting Guide

**Audience:** Developers  
**Last Updated:** 2026-02-26

## Database Issues

### "Can't reach database server"

**Symptoms:**
- Application won't start
- Error: "Can't reach database server at..."

**Solutions:**
1. Check `DATABASE_URL` is correct
2. Verify database is running (Supabase dashboard)
3. Check firewall/network settings
4. For Supabase, verify connection pooling is enabled
5. Try `DIRECT_URL` instead of `DATABASE_URL`

**Test connection:**
```bash
npx prisma db pull
```

### "Prisma Client not generated"

**Symptoms:**
- Error: "Cannot find module '@prisma/client'"
- TypeScript errors on prisma imports

**Solution:**
```bash
npx prisma generate
```

### "Migration failed"

**Symptoms:**
- Schema push fails
- Migration errors

**Solutions:**
1. Check database connection
2. Verify no conflicting data
3. Use `npx prisma db push` instead of migrate
4. Check Prisma schema syntax

## Authentication Issues

### "NEXTAUTH_SECRET is not set"

**Symptoms:**
- Application won't start
- Error about missing NEXTAUTH_SECRET

**Solution:**
```bash
# Generate secret
openssl rand -base64 32

# Add to .env
NEXTAUTH_SECRET="generated-secret-here"
```

### "Email not verified"

**Symptoms:**
- Can't sign in after sign up
- Error: "Please verify your email"

**Solutions:**
1. Check email inbox (and spam)
2. Resend verification email
3. Check SMTP configuration
4. Manually verify in database:
```sql
UPDATE "User" SET "emailVerified" = NOW() WHERE email = 'user@example.com';
```

### "Account locked"

**Symptoms:**
- Can't sign in
- Error: "Account is locked"

**Solutions:**
1. Wait 15 minutes for automatic unlock
2. Or reset manually in database:
```sql
UPDATE "User" 
SET "failedLoginAttempts" = 0, "lockedUntil" = NULL 
WHERE email = 'user@example.com';
```

### "Session not persisting"

**Symptoms:**
- Signed out after page refresh
- Session expires immediately

**Solutions:**
1. Check `NEXTAUTH_SECRET` is set
2. Check `NEXTAUTH_URL` matches domain
3. Clear browser cookies
4. Check browser allows cookies
5. Verify no CORS issues

## Email Issues

### "Email not sending"

**Symptoms:**
- No verification emails
- No password reset emails
- No confirmation emails

**Solutions:**
1. Check SMTP configuration:
```bash
# Verify all SMTP variables are set
echo $SMTP_HOST
echo $SMTP_PORT
echo $SMTP_USER
echo $SMTP_PASS
```

2. For Gmail, use App Password:
   - Enable 2FA on Google account
   - Generate App Password: https://myaccount.google.com/apppasswords
   - Use App Password as `SMTP_PASS`

3. Check email logs:
```bash
# Look for email errors in console
npm run dev
```

4. Test SMTP connection:
```typescript
// Add to a test file
import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
})

await transporter.verify()
console.log('SMTP connection successful')
```

### "Emails going to spam"

**Solutions:**
1. Use professional email domain
2. Set up SPF record
3. Set up DKIM
4. Use reputable SMTP provider
5. Avoid spam trigger words

## Build Issues

### "Build failed"

**Symptoms:**
- `npm run build` fails
- Deployment fails on Vercel

**Solutions:**
1. Clear Next.js cache:
```bash
rm -rf .next
```

2. Reinstall dependencies:
```bash
rm -rf node_modules package-lock.json
npm install
```

3. Check TypeScript errors:
```bash
npx tsc --noEmit
```

4. Check for missing environment variables

### "Module not found"

**Symptoms:**
- Error: "Cannot find module..."
- Import errors

**Solutions:**
1. Check file path is correct
2. Verify file exists
3. Check import statement syntax
4. Regenerate Prisma Client:
```bash
npx prisma generate
```

## Runtime Issues

### "Port 3000 already in use"

**Solution:**
```bash
# Kill process on port 3000
npx kill-port 3000

# Or use different port
PORT=3001 npm run dev
```

### "Out of memory"

**Symptoms:**
- Application crashes
- Build fails with memory error

**Solutions:**
1. Increase Node memory:
```bash
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

2. Close other applications
3. Restart computer

### "Hydration error"

**Symptoms:**
- Error: "Hydration failed"
- Content mismatch warnings

**Solutions:**
1. Check for client/server rendering mismatches
2. Verify no `useEffect` modifying initial render
3. Check for browser extensions interfering
4. Clear browser cache

## Deployment Issues

### "Vercel deployment failed"

**Solutions:**
1. Check build logs in Vercel dashboard
2. Verify environment variables are set
3. Check for TypeScript errors
4. Verify database connection
5. Check Prisma schema is valid

### "Database connection failed in production"

**Solutions:**
1. Use connection pooler URL (`?pgbouncer=true`)
2. Check Supabase connection limits
3. Verify `DATABASE_URL` is correct
4. Check IP allowlist (if configured)

### "Environment variables not working"

**Solutions:**
1. Verify variables are set in Vercel dashboard
2. Redeploy after adding variables
3. Check variable names match exactly
4. No quotes around values in Vercel

## Performance Issues

### "Slow page loads"

**Solutions:**
1. Check database query performance
2. Add database indexes
3. Use Prisma `select` to limit fields
4. Enable Vercel Analytics
5. Check Sentry for slow queries

### "High database usage"

**Solutions:**
1. Add connection pooling
2. Optimize queries
3. Add indexes
4. Use `select` instead of full models
5. Cache frequently accessed data

## Common Errors

### "Invalid `prisma.user.create()` invocation"

**Cause:** Missing required fields or invalid data

**Solution:**
1. Check all required fields are provided
2. Verify enum values are valid
3. Check field types match schema

### "Unique constraint failed"

**Cause:** Trying to create duplicate record

**Solution:**
1. Check for existing record first
2. Use `upsert` instead of `create`
3. Handle duplicate gracefully

### "Record not found"

**Cause:** Trying to access non-existent record

**Solution:**
1. Check record exists before accessing
2. Use `findUnique` with error handling
3. Return 404 if not found

## Getting Help

### Before Asking for Help

1. Check this troubleshooting guide
2. Search GitHub issues
3. Check Vercel/Supabase status pages
4. Review error logs carefully
5. Try to reproduce in clean environment

### When Asking for Help

Include:
- Error message (full stack trace)
- Steps to reproduce
- Environment (dev/production)
- Browser and OS
- What you've tried
- Relevant code snippets

### Support Channels

- GitHub Issues: [github.com/your-org/cofactor-scout/issues](https://github.com/your-org/cofactor-scout/issues)
- Email: support@cofactor.world
- Vercel Support: [vercel.com/support](https://vercel.com/support)
- Supabase Support: [supabase.com/support](https://supabase.com/support)

## Emergency Procedures

### Production Down

1. Check Vercel status
2. Check Supabase status
3. Review recent deployments
4. Rollback to last working deployment
5. Check error logs in Sentry
6. Notify team

### Database Issues

1. Check Supabase dashboard
2. Verify connection string
3. Check connection limits
4. Review recent schema changes
5. Restore from backup if needed

### Security Incident

1. Rotate all secrets immediately
2. Check access logs
3. Review recent changes
4. Notify affected users
5. Document incident
6. Implement fixes
