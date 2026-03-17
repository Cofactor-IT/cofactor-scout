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
    researchers: researchers.map((r: any) => ({
      researcherId: r.id,
      fullName: r.fullName,
      institutionalEmail: r.institutionalEmail,
      institution: r.institution,
      source: r.source as ResearcherSource,
      firstIngestedAt: r.firstIngestedAt,
      lastRefreshedAt: r.lastRefreshedAt,
      article14Status: r.article14Status as Article14Status,
      article14NotifiedAt: r.article14NotifiedAt,
      article14Attempts: r.article14Attempts,
      article14LastError: r.article14LastError,
    })),
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  }
}

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
    researcher: {
      researcherId: researcher.id,
      fullName: researcher.fullName,
      institutionalEmail: researcher.institutionalEmail,
      institution: researcher.institution,
      source: researcher.source as ResearcherSource,
      firstIngestedAt: researcher.firstIngestedAt,
      lastRefreshedAt: researcher.lastRefreshedAt,
      article14Status: researcher.article14Status as Article14Status,
      article14NotifiedAt: researcher.article14NotifiedAt,
      article14Attempts: researcher.article14Attempts,
      article14LastError: researcher.article14LastError,
    },
    notified,
    notifiedAt: researcher.article14NotifiedAt,
    attempts: researcher.article14Attempts,
    lastError: researcher.article14LastError,
  }
}

export async function getFailedNotificationCount(): Promise<number> {
  return await prisma.researcher.count({
    where: {
      article14Status: 'FAILED',
    },
  })
}

export async function getPendingNotificationCount(): Promise<number> {
  return await prisma.researcher.count({
    where: {
      article14Status: 'PENDING',
    },
  })
}

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

  return researchers.map((r: any) => ({
    researcherId: r.id,
    fullName: r.fullName,
    institutionalEmail: r.institutionalEmail,
    institution: r.institution,
    source: r.source as ResearcherSource,
    firstIngestedAt: r.firstIngestedAt,
    lastRefreshedAt: r.lastRefreshedAt,
    article14Status: r.article14Status as Article14Status,
    article14NotifiedAt: r.article14NotifiedAt,
    article14Attempts: r.article14Attempts,
    article14LastError: r.article14LastError,
  }))
}
