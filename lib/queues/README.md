# Background Job Queue System

This directory contains the background job queue system powered by BullMQ and Redis.

## Overview

The queue system handles:
- **Email Jobs**: Asynchronous email sending (welcome, verification, password reset, notifications)
- **Export Jobs**: Data export processing (user data, wiki pages, members, analytics)

## Architecture

```
┌─────────────────┐     ┌──────────────┐     ┌─────────────────┐
│   Next.js API   │────▶│  BullMQ      │────▶│  Redis          │
│   Routes        │     │  Queues      │     │  (Job Storage)  │
└─────────────────┘     └──────────────┘     └─────────────────┘
                               │
                               ▼
                        ┌──────────────┐
                        │  Worker      │
                        │  Process     │
                        │  (scripts/   │
                        │   worker.ts) │
                        └──────────────┘
```

## Files

- `connection.ts` - Redis connection configuration
- `email.queue.ts` - Email queue implementation
- `export.queue.ts` - Export queue implementation
- `status.ts` - Queue status monitoring utilities
- `index.ts` - Main exports
- `../scripts/worker.ts` - Worker process entry point

## Usage

### Starting the Worker

Development:
```bash
npm run worker
# or
npx ts-node scripts/worker.ts
```

Production:
```bash
npm run worker:prod
# or
node dist/scripts/worker.js
```

### Adding Email Jobs

```typescript
import { sendWelcomeEmail, sendVerificationEmail } from '@/lib/email'

// These functions automatically use the queue if available
await sendWelcomeEmail('user@example.com', 'John Doe')
await sendVerificationEmail('user@example.com', 'John Doe', 'token123')
await sendPasswordResetEmail('user@example.com', '123456')
await sendNotificationEmail('user@example.com', 'John', 'Title', 'Message', '/link')
```

### Creating Export Jobs

```typescript
// POST /api/exports
const response = await fetch('/api/exports', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        type: 'USER_DATA', // or 'WIKI_PAGES', 'MEMBERS', 'ANALYTICS'
        filters: { /* optional filters */ }
    })
})

const { exportJob } = await response.json()
```

### Checking Job Status

```typescript
// GET /api/queues/status/[jobId]
const response = await fetch(`/api/queues/status/${jobId}`)
const status = await response.json()
// { id, state, type, createdAt, attemptsMade, ... }
```

### Getting Queue Health

```typescript
import { getAllQueueStatus } from '@/lib/queues'

const health = await getAllQueueStatus()
// {
//   overallStatus: 'healthy' | 'degraded' | 'unhealthy',
//   redisConnected: boolean,
//   queues: [...],
//   timestamp: string
// }
```

## API Endpoints

- `POST /api/exports` - Create a new export job
- `GET /api/exports` - List user's export jobs
- `GET /api/queues/status/[jobId]` - Check job status
- `POST /api/queues/webhook` - Job completion webhook
- `GET /api/health` - Health check including queue status

## Configuration

### Environment Variables

```env
# Required
REDIS_URL=redis://localhost:6379

# For Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-password
SMTP_FROM="Cofactor Club" <no-reply@cofactor.world>

# For Links
NEXTAUTH_URL=https://your-domain.com
# or
APP_URL=https://your-domain.com
```

### Queue Options

Default job options are configured in each queue file:

- **Email Queue**: 3 attempts, exponential backoff starting at 1s
- **Export Queue**: 3 attempts, exponential backoff starting at 2s
- **Priority**: Password reset emails have priority 1, others have priority 2

## Graceful Degradation

If Redis is unavailable:
1. Email functions fall back to synchronous sending
2. Export jobs are still created in the database but marked as PENDING
3. API endpoints return appropriate error messages

## Monitoring

### Health Check

```bash
curl http://localhost:3000/api/health
```

### Queue Statistics

```typescript
import { getEmailQueue, getExportQueue } from '@/lib/queues'

const emailQueue = getEmailQueue()
const waiting = await emailQueue.getWaitingCount()
const active = await emailQueue.getActiveCount()
const failed = await emailQueue.getFailedCount()
```

### Cleanup

```typescript
import { cleanupOldJobs } from '@/lib/queues'

// Run periodically (e.g., via cron job)
await cleanupOldJobs()
```

### Retry Failed Jobs

```typescript
import { retryFailedJobs } from '@/lib/queues'

// Retry all failed email jobs
const retried = await retryFailedJobs('email')
console.log(`Retried ${retried} jobs`)
```

## Error Handling

- Jobs automatically retry 3 times with exponential backoff
- Failed jobs are kept for 7 days (email) or 30 days (export)
- Errors are logged using the centralized logger
- Sentry captures exceptions in production

## Database Integration

Export jobs are tracked in the `ExportJob` table:

```prisma
model ExportJob {
    id          String
    userId      String
    type        ExportType
    status      JobStatus  // PENDING, PROCESSING, COMPLETED, FAILED
    fileUrl     String?
    createdAt   DateTime
    completedAt DateTime?
}
```

## Best Practices

1. **Always check Redis health** before critical operations
2. **Handle queue unavailability** gracefully - functions fall back to sync
3. **Monitor failed jobs** and retry periodically
4. **Clean up old jobs** to prevent Redis memory issues
5. **Use job IDs** to track progress and show status to users
6. **Set appropriate priorities** for time-sensitive jobs

## Troubleshooting

### Worker not processing jobs

1. Check Redis connection: `redis-cli ping`
2. Verify worker is running: `ps aux | grep worker`
3. Check logs for errors
4. Ensure `REDIS_URL` is set correctly

### Jobs failing immediately

1. Check job data is valid
2. Verify all required metadata is provided
3. Check worker logs for error details
4. Ensure all environment variables are set

### Redis connection errors

1. Verify Redis is running
2. Check `REDIS_URL` format
3. Check firewall/network settings
4. Review Redis memory usage

## Deployment

### Docker

```dockerfile
# Start worker alongside the app
CMD ["sh", "-c", "npm run start & npm run worker:prod"]
```

### Kubernetes

Run worker as a separate deployment:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: worker
spec:
  replicas: 2
  template:
    spec:
      containers:
      - name: worker
        image: your-app:latest
        command: ["npm", "run", "worker:prod"]
```

### Vercel

Vercel doesn't support long-running processes. For production:
1. Deploy worker to a separate service (e.g., Railway, Fly.io)
2. Or use a serverless-friendly queue like SQS + Lambda
