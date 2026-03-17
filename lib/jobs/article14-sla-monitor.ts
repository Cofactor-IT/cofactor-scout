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
    message += 'Check the admin dashboard at /api/admin/article14 for details.\n'
  }

  message += '\nAction: Review and retry failed notifications, investigate pending near-SLA items.'
  message += '\n\nThis is an automated alert from the GDPR Article 14 SLA monitoring system.'

  return message
}
