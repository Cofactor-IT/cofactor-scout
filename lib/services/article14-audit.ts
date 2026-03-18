/**
 * article14-audit.ts
 * 
 * Audit query functions for GDPR Article 14 compliance monitoring.
 * Provides structured access to researcher notification status, SLA tracking,
 * and compliance reporting for the Article 14 notification system.
 * 
 * Key responsibilities:
 * - Retrieve paginated audit logs with filtering
 * - Track notification status per researcher
 * - Monitor SLA compliance (24-hour notification deadline)
 * - Provide statistics and source breakdowns
 * 
 * @module
 */

import { prisma } from '@/lib/database/prisma'

type Article14Status = 'NOT_REQUIRED' | 'PENDING' | 'SENT' | 'FAILED'
type ResearcherSource = 'OPENALEX' | 'ORCID' | 'CROSSREF' | 'PUBMED' | 'SEMANTIC_SCHOLAR' | 'PATENTSVIEW' | 'MANUAL'

interface Article14AuditFilters {
  status?: Article14Status
  source?: ResearcherSource
  from?: Date
  to?: Date
  page?: number
  pageSize?: number
}

interface Article14AuditLogEntry {
  researcherId: string
  fullName: string
  institutionalEmail: string | null
  institution: string | null
  source: ResearcherSource
  firstIngestedAt: Date
  lastRefreshedAt: Date
  article14Status: Article14Status
  article14NotifiedAt: Date | null
  article14Attempts: number
  article14LastError: string | null
}

interface Article14AuditResult {
  researchers: Article14AuditLogEntry[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

interface Article14ResearcherStatus {
  researcher: Article14AuditLogEntry
  notified: boolean
  notifiedAt: Date | null
  attempts: number
  lastError: string | null
}

interface ResearcherSelectResult {
  id: string
  fullName: string
  institutionalEmail: string | null
  institution: string | null
  source: ResearcherSource
  firstIngestedAt: Date
  lastRefreshedAt: Date
  article14Status: Article14Status
  article14NotifiedAt: Date | null
  article14Attempts: number
  article14LastError: string | null
}

/**
 * Retrieves Article 14 audit log with pagination and filtering.
 * Supports filtering by status, source, and date range. Results are
 * ordered by ingestion date (newest first).
 * 
 * @param filters - Filter parameters for querying the audit log
 * @param filters.status - Optional Article 14 status filter
 * @param filters.source - Optional researcher source filter
 * @param filters.from - Optional start date for date range filter
 * @param filters.to - Optional end date for date range filter
 * @param filters.page - Page number (1-indexed, default: 1)
 * @param filters.pageSize - Number of results per page (default: 50)
 * @returns Paginated audit log results with total count
 */
export async function getArticle14AuditLog(
  filters: Article14AuditFilters = {}
): Promise<Article14AuditResult> {
  const {
    status,
    source,
    from,
    to,
    page = 1,
    pageSize = 50,
  } = filters

  const where: Record<string, unknown> = {}

  if (status) {
    where.article14Status = status
  }

  if (source) {
    where.source = source
  }

  if (from || to) {
    where.firstIngestedAt = {
      ...(from && { gte: from }),
      ...(to && { lte: to }),
    }
  }

  const skip = (page - 1) * pageSize

  const [researchers, total] = await Promise.all([
    prisma.researcher.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { firstIngestedAt: 'desc' },
      select: {
        id: true,
        fullName: true,
        institutionalEmail: true,
        institution: true,
        source: true,
        firstIngestedAt: true,
        lastRefreshedAt: true,
        article14Status: true,
        article14NotifiedAt: true,
        article14Attempts: true,
        article14LastError: true,
      },
    }),
    prisma.researcher.count({ where }),
  ])

  return {
    researchers: researchers.map(mapToAuditEntry),
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  }
}

/**
 * Maps Prisma researcher select result to audit log entry format.
 * 
 * @param researcher - Raw researcher data from Prisma select
 * @returns Formatted audit log entry
 */
function mapToAuditEntry(researcher: ResearcherSelectResult): Article14AuditLogEntry {
  return {
    researcherId: researcher.id,
    fullName: researcher.fullName,
    institutionalEmail: researcher.institutionalEmail,
    institution: researcher.institution,
    source: researcher.source,
    firstIngestedAt: researcher.firstIngestedAt,
    lastRefreshedAt: researcher.lastRefreshedAt,
    article14Status: researcher.article14Status,
    article14NotifiedAt: researcher.article14NotifiedAt,
    article14Attempts: researcher.article14Attempts,
    article14LastError: researcher.article14LastError,
  }
}

/**
 * Retrieves detailed Article 14 notification status for a specific researcher.
 * Includes notification timestamps, attempt counts, and last error if any.
 * 
 * @param researcherId - Unique researcher identifier
 * @returns Researcher notification status or null if not found
 */
export async function getResearcherNotificationStatus(
  researcherId: string
): Promise<Article14ResearcherStatus | null> {
  const researcher = await prisma.researcher.findUnique({
    where: { id: researcherId },
    select: {
      id: true,
      fullName: true,
      institutionalEmail: true,
      institution: true,
      source: true,
      firstIngestedAt: true,
      lastRefreshedAt: true,
      article14Status: true,
      article14NotifiedAt: true,
      article14Attempts: true,
      article14LastError: true,
    },
  })

  if (!researcher) {
    return null
  }

  const notified = !!researcher.article14NotifiedAt

  return {
    researcher: mapToAuditEntry(researcher as ResearcherSelectResult),
    notified,
    notifiedAt: researcher.article14NotifiedAt,
    attempts: researcher.article14Attempts,
    lastError: researcher.article14LastError,
  }
}

/**
 * Counts researchers with failed Article 14 notifications.
 * Used for SLA monitoring and alerting.
 * 
 * @returns Number of researchers with FAILED status
 */
export async function getFailedNotificationCount(): Promise<number> {
  return await prisma.researcher.count({
    where: {
      article14Status: 'FAILED',
    },
  })
}

/**
 * Counts researchers with pending Article 14 notifications.
 * Used for queue monitoring and capacity planning.
 * 
 * @returns Number of researchers with PENDING status
 */
export async function getPendingNotificationCount(): Promise<number> {
  return await prisma.researcher.count({
    where: {
      article14Status: 'PENDING',
    },
  })
}

/**
 * Retrieves researchers with pending notifications approaching SLA deadline.
 * Default threshold is 20 hours (SLA is 24 hours from ingestion).
 * Results ordered by ingestion date (oldest first) for prioritization.
 * 
 * @param hoursThreshold - Hours before deadline to alert (default: 20)
 * @returns List of researchers near SLA deadline
 */
export async function getPendingNearSLA(
  hoursThreshold: number = 20
): Promise<Article14AuditLogEntry[]> {
  const threshold = new Date()
  threshold.setHours(threshold.getHours() - hoursThreshold)

  const researchers = await prisma.researcher.findMany({
    where: {
      article14Status: 'PENDING',
      firstIngestedAt: {
        lt: threshold,
      },
    },
    select: {
      id: true,
      fullName: true,
      institutionalEmail: true,
      institution: true,
      source: true,
      firstIngestedAt: true,
      lastRefreshedAt: true,
      article14Status: true,
      article14NotifiedAt: true,
      article14Attempts: true,
      article14LastError: true,
    },
    orderBy: { firstIngestedAt: 'asc' },
  })

  return researchers.map(mapToAuditEntry)
}
