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

import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/database/prisma'

type Article14Status = 'NOT_REQUIRED' | 'PENDING' | 'SENT' | 'FAILED'
type ResearcherSource = 'OPENALEX' | 'ORCID' | 'CROSSREF' | 'PUBMED' | 'SEMANTIC_SCHOLAR' | 'PATENTSVIEW' | 'MANUAL'

interface Article14AuditFilters {
  status?: Article14Status
  source?: ResearcherSource
  search?: string
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

interface Article14StatsResult {
  totalResearchers: number
  notifiedResearchers: number
  pendingResearchers: number
  failedResearchers: number
  noEmailResearchers: number
  notifiedRate: string
  sources: Array<{
    source: ResearcherSource
    count: number
  }>
}

interface Article14StatsCounts {
  totalResearchers: number
  notifiedResearchers: number
  pendingResearchers: number
  failedResearchers: number
  noEmailResearchers: number
  sources: Array<{
    source: ResearcherSource
    count: number
  }>
}

interface SourceCountRecord {
  source: ResearcherSource
  count: number
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
 * Supports filtering by status, source, text search, and date range. Results are
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
    search,
    from,
    to,
    page = 1,
    pageSize = 50,
  } = filters

  const where: Prisma.ResearcherWhereInput = {}

  if (status) {
    where.article14Status = status
  }

  if (source) {
    where.source = source
  }

  if (search) {
    where.OR = [
      { fullName: { contains: search, mode: 'insensitive' } },
      { firstName: { contains: search, mode: 'insensitive' } },
      { lastName: { contains: search, mode: 'insensitive' } },
      { institutionalEmail: { contains: search, mode: 'insensitive' } },
      { institution: { contains: search, mode: 'insensitive' } },
      { department: { contains: search, mode: 'insensitive' } },
      { article14LastError: { contains: search, mode: 'insensitive' } },
    ]
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

function buildStatsWhere(
  source?: ResearcherSource,
  days: number = 30
): Prisma.ResearcherWhereInput {
  const where: Prisma.ResearcherWhereInput = {}
  const cutoff = new Date()

  cutoff.setDate(cutoff.getDate() - days)
  where.firstIngestedAt = { gte: cutoff }

  if (source) {
    where.source = source
  }

  return where
}

async function countResearchers(
  where: Prisma.ResearcherWhereInput,
  status: Article14Status
): Promise<number> {
  return await prisma.researcher.count({
    where: {
      ...where,
      article14Status: status,
    },
  })
}

async function groupResearchersBySource(
  where: Prisma.ResearcherWhereInput
): Promise<SourceCountRecord[]> {
  const researchers = await prisma.researcher.findMany({
    where,
    select: { source: true },
  })
  const counts = new Map<ResearcherSource, number>()
  for (const researcher of researchers) {
    counts.set(researcher.source, (counts.get(researcher.source) ?? 0) + 1)
  }
  return Array.from(counts.entries())
    .map(([source, count]) => ({ source, count }))
    .sort((a, b) => b.count - a.count)
}

async function loadArticle14StatsData(
  where: Prisma.ResearcherWhereInput
): Promise<Article14StatsCounts> {
  const [totalResearchers, notifiedResearchers, pendingResearchers, failedResearchers, noEmailResearchers, sources] = await Promise.all([
    prisma.researcher.count({ where }),
    countResearchers(where, 'SENT'),
    countResearchers(where, 'PENDING'),
    countResearchers(where, 'FAILED'),
    countResearchers(where, 'NOT_REQUIRED'),
    groupResearchersBySource(where),
  ])

  return {
    totalResearchers,
    notifiedResearchers,
    pendingResearchers,
    failedResearchers,
    noEmailResearchers,
    sources,
  }
}

function formatArticle14Stats(
  counts: Article14StatsCounts
): Article14StatsResult {
  const notifiedRate = counts.totalResearchers > 0
    ? ((counts.notifiedResearchers / counts.totalResearchers) * 100).toFixed(1)
    : '0.0'

  return {
    ...counts,
    notifiedRate: `${notifiedRate}%`,
  }
}

/**
 * Retrieves filtered Article 14 statistics for the admin dashboard.
 * Applies the same source and time-window filters to headline counts
 * and source breakdown data so the results stay internally consistent.
 * 
 * @param filters - Optional statistics filters
 * @param filters.source - Restrict results to a single ingestion source
 * @param filters.days - Restrict results to researchers ingested within the last N days
 * @returns Filtered statistics with counts, rate, and source breakdown
 */
export async function getArticle14AuditStats(filters: {
  source?: ResearcherSource
  days?: number
} = {}): Promise<Article14StatsResult> {
  return formatArticle14Stats(await loadArticle14StatsData(
    buildStatsWhere(filters.source, filters.days ?? 30)
  ))
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
