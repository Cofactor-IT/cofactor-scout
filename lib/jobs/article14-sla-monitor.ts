/**
 * article14-sla-monitor.ts
 * 
 * SLA monitoring for GDPR Article 14 notification compliance.
 * Tracks notification progress and alerts on approaching or missed deadlines.
 * 
 * Key responsibilities:
 * - Monitor notifications approaching 24-hour SLA deadline
 * - Count failed notifications requiring manual review
 * - Format alert messages for admin notification
 * - Track hours since ingestion for prioritization
 * 
 * SLA requirements:
 * - Article 14 notifications must be sent within 24 hours of data ingestion
 * - Alert threshold: 20 hours after ingestion (4 hours buffer)
 * - Failed notifications require immediate manual review
 * 
 * @module
 */

import {
  getPendingNearSLA,
  getFailedNotificationCount,
} from '@/lib/services/article14-audit'
import { logger } from '@/lib/logger'

export interface SLAMonitorResult {
  pendingNearSLA: Array<{
    researcherId: string
    fullName: string
    institutionalEmail: string | null
    institution: string | null
    firstIngestedAt: Date
    hoursSinceIngestion: number
  }>
  failedCount: number
  needsAttention: boolean
}

/**
 * Runs SLA monitor to check Article 14 notification compliance.
 * Identifies notifications approaching deadline and failed notifications.
 * 
 * @param hoursThreshold - Hours before deadline to alert (default: 20)
 * @returns SLA monitoring result with near-SLA items and failures
 */
export async function runSLAMonitor(
  hoursThreshold: number = 20
): Promise<SLAMonitorResult> {
  logger.info('Running Article 14 SLA monitor', { hoursThreshold })

  const pendingNearSLA = await getPendingNearSLA(hoursThreshold)
  const failedCount = await getFailedNotificationCount()

  const now = new Date()

  const pendingNearSLAWithHours = pendingNearSLA.map((r) => ({
    researcherId: r.researcherId,
    fullName: r.fullName,
    institutionalEmail: r.institutionalEmail,
    institution: r.institution,
    firstIngestedAt: r.firstIngestedAt,
    hoursSinceIngestion: Math.floor(
      (now.getTime() - r.firstIngestedAt.getTime()) / (1000 * 60 * 60)
    ),
  }))

  const needsAttention = pendingNearSLAWithHours.length > 0 || failedCount > 0

  if (needsAttention) {
    logger.warn('Article 14 SLA monitor found issues', {
      pendingNearSLA: pendingNearSLAWithHours.length,
      failedCount,
    })
  } else {
    logger.info('Article 14 SLA monitor: all clear')
  }

  return {
    pendingNearSLA: pendingNearSLAWithHours,
    failedCount,
    needsAttention,
  }
}

/**
 * Formats SLA monitoring result into human-readable alert message.
 * Includes list of near-SLA items and failed notification count.
 * 
 * @param result - SLA monitoring result
 * @returns Formatted alert message for email/notification
 */
export function formatSLAAlert(result: SLAMonitorResult): string {
  if (!result.needsAttention) {
    return 'Article 14 SLA Monitor: All notifications are within SLA. No action required.'
  }

  let message = 'Article 14 SLA Monitor: Action Required!\n\n'

  if (result.pendingNearSLA.length > 0) {
    message += `${result.pendingNearSLA.length} notification(s) approaching 24h deadline:\n\n`
    result.pendingNearSLA.slice(0, 10).forEach((r) => {
      message += `- ${r.fullName} (${r.institutionalEmail || 'no email'}) - ${r.hoursSinceIngestion}h since ingestion\n`
    })
    if (result.pendingNearSLA.length > 10) {
      message += `... and ${result.pendingNearSLA.length - 10} more\n`
    }
    message += '\n'
  }

  if (result.failedCount > 0) {
    message += `${result.failedCount} notification(s) failed and require manual review.\n`
    message += 'Check the admin dashboard at /admin/scouts for details.\n'
  }

  message += '\nAction: Review and retry failed notifications, investigate pending near-SLA items.'
  message += '\n\nThis is an automated alert from the GDPR Article 14 SLA monitoring system.'

  return message
}
