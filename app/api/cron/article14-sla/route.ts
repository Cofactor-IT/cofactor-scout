/**
 * route.ts
 * 
 * Cron endpoint for GDPR Article 14 SLA monitoring.
 * Protected by CRON_SECRET environment variable for security.
 * 
 * Key responsibilities:
 * - Run SLA monitor for notification compliance
 * - Send alert emails when issues detected
 * - Track notifications approaching 24-hour deadline
 * - Count failed notifications requiring manual review
 * 
 * Security:
 * - Requires CRON_SECRET in Authorization header
 * - Bearer token format: "Bearer <secret>"
 * - Logs unauthorized access attempts
 * 
 * Expected cron schedule: Every hour
 * 
 * @module
 */

import { NextResponse } from 'next/server'
import { runSLAMonitor, formatSLAAlert } from '@/lib/jobs/article14-sla-monitor'
import { sendNotificationEmail } from '@/lib/email/send'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const CRON_SECRET = process.env.CRON_SECRET

/**
 * GET endpoint for Article 14 SLA monitoring cron job.
 * Protected by CRON_SECRET for security.
 * 
 * @param request - Request with Authorization header containing CRON_SECRET
 * @returns JSON response with monitoring results
 * @throws {Error} Returns 401 if CRON_SECRET not provided or invalid
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  const secret = authHeader?.replace('Bearer ', '')

  if (!CRON_SECRET || secret !== CRON_SECRET) {
    logger.warn('Unauthorized cron access attempt', {
      ip: request.headers.get('x-forwarded-for') || 'unknown',
    })
    return new NextResponse('Unauthorized', { status: 401 })
  }

  logger.info('Article 14 SLA monitor cron job started')

  try {
    const result = await runSLAMonitor(20)

    if (result.needsAttention) {
      const alertMessage = formatSLAAlert(result)

      const adminEmail = process.env.SLA_ALERT_EMAIL || process.env.ADMIN_EMAIL
      if (adminEmail) {
        try {
          await sendNotificationEmail(
            adminEmail,
            'Admin',
            'Article 14 SLA Alert: Action Required',
            alertMessage,
            '/admin/article14'
          )
          logger.info('SLA alert email sent to admin', {
            pendingNearSLA: result.pendingNearSLA.length,
            failedCount: result.failedCount,
          })
        } catch (error) {
          logger.error('Failed to send SLA alert email', {
            error: error instanceof Error ? error.message : String(error),
          })
        }
      }
    }

    logger.info('Article 14 SLA monitor cron job completed', {
      pendingNearSLA: result.pendingNearSLA.length,
      failedCount: result.failedCount,
      needsAttention: result.needsAttention,
    })

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      result: {
        pendingNearSLA: result.pendingNearSLA.length,
        failedCount: result.failedCount,
        needsAttention: result.needsAttention,
      },
    })
  } catch (error) {
    logger.error('Article 14 SLA monitor cron job failed', {
      error: error instanceof Error ? error.message : String(error),
    })
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
