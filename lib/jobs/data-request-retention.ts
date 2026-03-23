/**
 * data-request-retention.ts
 *
 * Scheduled job for GDPR data retention compliance.
 * Automatically soft-deletes completed requests after 5 years
 * and hard-deletes soft-deleted requests after 1 year audit period.
 *
 * Runs monthly to check for expired requests.
 */

import { logger } from '@/lib/logger'
import { findRequestsForCleanup, softDeleteRequest, hardDeleteRequest } from '@/lib/database/queries/data-subject-requests'

const RETENTION_YEARS = 5
const AUDIT_PERIOD_YEARS = 1

/**
 * Main retention cleanup function.
 * Finds eligible requests and performs appropriate deletion.
 */
export async function executeDataRequestRetention() {
  logger.info('Starting data request retention cleanup')

  const requests = await findRequestsForCleanup()
  logger.info('Found requests for cleanup', { count: requests.length })

  for (const request of requests) {
    try {
      if (request.status === 'COMPLETED') {
        await softDeleteRequest(request.requestId)
        logger.info('Soft deleted completed request', {
          requestId: request.requestId,
          retentionPeriod: `${RETENTION_YEARS} years`
        })
      } else if (request.deletedAt) {
        await hardDeleteRequest(request.id)
        logger.info('Hard deleted request after audit period', {
          requestId: request.requestId,
          auditPeriod: `${AUDIT_PERIOD_YEARS} years`
        })
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      logger.error('Failed to cleanup request', {
        requestId: request.requestId,
        error: errorMessage
      }, error instanceof Error ? error : new Error(errorMessage))
    }
  }

  logger.info('Data request retention cleanup completed', {
    totalProcessed: requests.length
  })
}
