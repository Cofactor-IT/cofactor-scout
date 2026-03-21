/**
 * api/cron/data-request-retention/route.ts
 *
 * Cron job endpoint for GDPR data retention cleanup.
 * Executes monthly to soft-delete completed requests after 5 years
 * and hard-delete soft-deleted requests after 1 year audit period.
 *
 * Security: Requires CRON_SECRET for authentication.
 */

import { NextRequest, NextResponse } from 'next/server'
import { executeDataRequestRetention } from '@/lib/jobs/data-request-retention'
import { logger } from '@/lib/logger'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  const cronSecret = request.headers.get('authorization')

  if (cronSecret !== `Bearer ${process.env.CRON_SECRET}`) {
    logger.warn('Unauthorized cron job access attempt')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  logger.info('Executing data request retention cron job')

  try {
    await executeDataRequestRetention()
    return NextResponse.json({ success: true, message: 'Retention cleanup completed' })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    logger.error('Data request retention cron job failed', { error: errorMessage })
    return NextResponse.json(
      { error: 'Retention cleanup failed' },
      { status: 500 }
    )
  }
}
