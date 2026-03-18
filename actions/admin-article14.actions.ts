/**
 * admin-article14.actions.ts
 * 
 * Server Actions for GDPR Article 14 admin operations.
 * Replaces API routes with Next.js Server Actions per AGENTS.md.
 * 
 * Key responsibilities:
 * - Retrieve audit log with pagination and filtering
 * - Retry failed Article 14 notifications
 * - Provide statistics and source breakdowns
 * 
 * All actions require ADMIN role authentication via NextAuth.
 * 
 * @module
 */

'use server'

import { requireAdmin } from '@/lib/auth/session'
import { 
  getArticle14AuditLog, 
  getFailedNotificationCount,
  getPendingNotificationCount
} from '@/lib/services/article14-audit'
import { addArticle14Job } from '@/lib/queues/article14.queue'
import { prisma } from '@/lib/database/prisma'
import { logger } from '@/lib/logger'
import { 
  auditLogQuerySchema, 
  retryNotificationSchema, 
  statsQuerySchema 
} from '@/lib/validation/schemas'

/**
 * Retrieves Article 14 audit log with pagination and filtering.
 * Supports filtering by status, source, date range, and text search.
 * 
 * @param params - Query parameters for filtering and pagination
 * @returns Paginated audit log entries
 * @throws {Error} If user is not authenticated or not an admin
 */
export async function getAuditLog(params: unknown) {
  const admin = await requireAdmin()

  try {
    const validated = auditLogQuerySchema.parse(params)

    const filters: {
      status?: 'NOT_REQUIRED' | 'PENDING' | 'SENT' | 'FAILED'
      source?: 'OPENALEX' | 'ORCID' | 'CROSSREF' | 'PUBMED' | 'SEMANTIC_SCHOLAR' | 'PATENTSVIEW' | 'MANUAL'
      from?: Date
      to?: Date
      page: number
      pageSize: number
    } = {
      status: validated.status as any,
      source: validated.source as any,
      page: validated.page,
      pageSize: validated.limit,
    }

    if (validated.from) {
      filters.from = new Date(validated.from)
    }

    if (validated.to) {
      filters.to = new Date(validated.to)
    }

    const result = await getArticle14AuditLog(filters)

    logger.info('Article 14 audit log retrieved', {
      adminId: admin.id,
      page: validated.page,
      limit: validated.limit,
      total: result.total,
    })

    return result
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      logger.warn('Invalid audit log query parameters', {
        adminId: admin.id,
        error: error.message,
      })
      throw new Error('Invalid query parameters')
    }
    throw error
  }
}

/**
 * Manually retries a failed Article 14 notification.
 * Queues new notification job and resets researcher status to PENDING.
 * 
 * @param data - Retry request with researcher ID
 * @returns Success status and job ID
 * @throws {Error} If user is not authenticated, not an admin, or researcher not found
 */
export async function retryNotification(data: unknown) {
  const admin = await requireAdmin()

  try {
    const validated = retryNotificationSchema.parse(data)

    const researcher = await prisma.researcher.findUnique({
      where: { id: validated.researcherId },
    })

    if (!researcher) {
      logger.warn('Retry failed: researcher not found', {
        adminId: admin.id,
        researcherId: validated.researcherId,
      })
      throw new Error('Researcher not found')
    }

    if (!researcher.institutionalEmail) {
      logger.warn('Retry failed: researcher has no email', {
        adminId: admin.id,
        researcherId: validated.researcherId,
      })
      throw new Error('Researcher has no institutional email')
    }

    if (researcher.article14Status === 'SENT') {
      logger.info('Retry skipped: notification already sent', {
        adminId: admin.id,
        researcherId: validated.researcherId,
        notifiedAt: researcher.article14NotifiedAt,
      })
      return {
        success: false,
        message: 'Article 14 notification already sent',
        notifiedAt: researcher.article14NotifiedAt,
      }
    }

    const job = await addArticle14Job(
      researcher.id,
      researcher.institutionalEmail,
      researcher.fullName,
      researcher.source,
      `manual-retry-${Date.now()}`
    )

    if (!job) {
      logger.error('Retry failed: queue unavailable', {
        adminId: admin.id,
        researcherId: validated.researcherId,
      })
      throw new Error('Failed to enqueue retry job')
    }

    await prisma.researcher.update({
      where: { id: validated.researcherId },
      data: {
        article14Status: 'PENDING',
        article14Attempts: 0,
        article14LastError: null,
      },
    })

    logger.info('Article 14 notification retry enqueued', {
      adminId: admin.id,
      researcherId: validated.researcherId,
      jobId: job.id,
    })

    return {
      success: true,
      message: 'Article 14 notification retry enqueued',
      jobId: job.id,
    }
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      logger.warn('Invalid retry notification parameters', {
        adminId: admin.id,
        error: error.message,
      })
      throw new Error('Invalid parameters')
    }
    throw error
  }
}

/**
 * Retrieves Article 14 notification statistics.
 * Provides breakdown by status and source with optional filtering.
 * 
 * @param params - Optional query parameters for filtering
 * @returns Statistics including counts, rates, and source breakdown
 * @throws {Error} If user is not authenticated or not an admin
 */
export async function getAuditStats(params?: unknown) {
  const admin = await requireAdmin()

  try {
    const validated = params ? statsQuerySchema.parse(params) : statsQuerySchema.parse({})

    const [
      totalResearchers,
      notifiedResearchers,
      pendingResearchers,
      failedResearchers,
      noEmailResearchers,
    ] = await Promise.all([
      prisma.researcher.count(),
      prisma.researcher.count({
        where: { article14Status: 'SENT' },
      }),
      prisma.researcher.count({
        where: { article14Status: 'PENDING' },
      }),
      prisma.researcher.count({
        where: { article14Status: 'FAILED' },
      }),
      prisma.researcher.count({
        where: { article14Status: 'NOT_REQUIRED' },
      }),
    ])

    const notifiedRate = totalResearchers > 0
      ? ((notifiedResearchers / totalResearchers) * 100).toFixed(1)
      : '0.0'

    const sources = await prisma.researcher.groupBy({
      by: ['source'],
      where: validated.source ? { source: validated.source as any } : undefined,
      _count: {
        _all: true,
      },
    })

    const sourceBreakdown = sources
      .map((r) => ({
        source: r.source,
        count: r._count._all,
      }))
      .sort((a, b) => b.count - a.count)

    logger.info('Article 14 statistics retrieved', {
      adminId: admin.id,
      total: totalResearchers,
      notified: notifiedResearchers,
      pending: pendingResearchers,
      failed: failedResearchers,
    })

    return {
      totalResearchers,
      notifiedResearchers,
      pendingResearchers,
      failedResearchers,
      noEmailResearchers,
      notifiedRate: `${notifiedRate}%`,
      sources: sourceBreakdown,
    }
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      logger.warn('Invalid statistics query parameters', {
        adminId: admin.id,
        error: error.message,
      })
      throw new Error('Invalid query parameters')
    }
    throw error
  }
}
