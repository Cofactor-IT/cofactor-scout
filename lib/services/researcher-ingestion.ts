/**
 * researcher-ingestion.ts
 * 
 * Researcher ingestion and deduplication service for GDPR Article 14 compliance.
 * Manages creation and updates of researcher records with automatic notification
 * triggering for new researchers with email addresses.
 * 
 * Key responsibilities:
 * - Deduplicate researchers by email, ORCID, OpenAlex, and Semantic Scholar IDs
 * - Create new researcher records with Article 14 status tracking
 * - Queue Article 14 notifications for new researchers with email
 * - Update existing researcher records on re-ingestion
 * - Handle queue failures with synchronous fallback
 * 
 * Deduplication strategy (checked in order):
 * 1. Institutional email (primary identifier)
 * 2. ORCID ID
 * 3. OpenAlex ID
 * 4. Semantic Scholar ID
 * 
 * @module
 */

import { prisma } from '@/lib/database/prisma'
import { addArticle14Job } from '@/lib/queues/article14.queue'
import { info, warn, error } from '@/lib/logger'
import { sendArticle14Email } from '@/lib/email/brevo'
import { Prisma } from '@prisma/client'

type ResearcherSource = 'OPENALEX' | 'ORCID' | 'CROSSREF' | 'PUBMED' | 'SEMANTIC_SCHOLAR' | 'PATENTSVIEW' | 'MANUAL'
type Article14Status = 'NOT_REQUIRED' | 'PENDING' | 'SENT' | 'FAILED'

interface ResearcherIngestionData {
  fullName: string
  firstName?: string
  lastName?: string
  institutionalEmail?: string
  institution?: string
  department?: string
  orcidId?: string
  openAlexId?: string
  semanticScholarId?: string
  source: ResearcherSource
  sourceId?: string
  rawData?: Prisma.InputJsonValue
}

interface IngestionResult {
  researcherId: string
  wasCreated: boolean
}

/**
 * Processes researcher ingestion with deduplication and Article 14 notification.
 * Main entry point for researcher data ingestion from all sources.
 * 
 * Workflow:
 * 1. Check for existing researcher (deduplication)
 * 2. If exists: Update lastRefreshedAt and return
 * 3. If new: Create researcher record
 * 4. If new with email: Queue Article 14 notification
 * 5. If queue fails: Attempt synchronous fallback
 * 
 * @param data - Researcher data to ingest
 * @returns Ingestion result with researcher ID and creation status
 * @throws {Error} If database operations fail
 */
export async function processResearcherIngestion(
  data: ResearcherIngestionData
): Promise<IngestionResult> {
  const normalized = normalizeIngestionData(data)
  const { fullName, institutionalEmail, source } = normalized

  info('Processing researcher ingestion', {
    fullName,
    email: institutionalEmail ? '**REDACTED**' : undefined,
    source,
  })

  try {
    const existingResearcher = await findExistingResearcher(normalized)

    if (existingResearcher) {
      const shouldQueue = await updateExistingResearcher(existingResearcher, normalized)
      if (shouldQueue) {
        await queueNotificationForResearcher(
          existingResearcher.id,
          normalized.institutionalEmail!,
          normalized.fullName,
          normalized.source,
          normalized.institution
        )
      }
      return { researcherId: existingResearcher.id, wasCreated: false }
    }

    const createdResearcher = await createResearcher(normalized)

    if (createdResearcher.wasCreated) {
      info('Created new researcher', {
        researcherId: createdResearcher.researcher.id,
        fullName,
        source,
        article14Status: createdResearcher.researcher.article14Status,
      })
    } else {
      info('Recovered existing researcher after unique conflict', {
        researcherId: createdResearcher.researcher.id,
        fullName,
        source,
      })
    }

    if (normalized.institutionalEmail) {
      await queueNotificationForResearcher(
        createdResearcher.researcher.id,
        normalized.institutionalEmail,
        normalized.fullName,
        normalized.source,
        normalized.institution
      )
    }

    return {
      researcherId: createdResearcher.researcher.id,
      wasCreated: createdResearcher.wasCreated,
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err)
    error('Error processing researcher ingestion', {
      fullName,
      source,
      error: errorMessage,
    })
    throw err
  }
}

function normalizeIngestionData(data: ResearcherIngestionData) {
  return {
    ...data,
    fullName: data.fullName.trim(),
    firstName: normalizeText(data.firstName),
    lastName: normalizeText(data.lastName),
    institutionalEmail: normalizeText(data.institutionalEmail)?.toLowerCase(),
    institution: normalizeText(data.institution),
    department: normalizeText(data.department),
    orcidId: normalizeText(data.orcidId),
    openAlexId: normalizeText(data.openAlexId),
    semanticScholarId: normalizeText(data.semanticScholarId),
    sourceId: normalizeText(data.sourceId),
  }
}

function normalizeText(value?: string) {
  const trimmed = value?.trim()
  return trimmed ? trimmed : undefined
}

/**
 * Finds existing researcher by deduplication identifiers.
 * Checks in order: institutional email, ORCID, OpenAlex, Semantic Scholar.
 * 
 * @param identifiers - Deduplication identifiers
 * @returns Existing researcher or null if not found
 */
async function findExistingResearcher(
  identifiers: {
    institutionalEmail?: string
    orcidId?: string
    openAlexId?: string
    semanticScholarId?: string
    sourceId?: string
  }
) {
  const { institutionalEmail, orcidId, openAlexId, semanticScholarId } = identifiers

  if (institutionalEmail) {
    const researcher = await prisma.researcher.findUnique({
      where: { institutionalEmail },
    })
    if (researcher) return researcher
  }

  if (orcidId) {
    const researcher = await prisma.researcher.findUnique({
      where: { orcidId },
    })
    if (researcher) return researcher
  }

  if (openAlexId) {
    const researcher = await prisma.researcher.findUnique({
      where: { openAlexId },
    })
    if (researcher) return researcher
  }

  if (semanticScholarId) {
    const researcher = await prisma.researcher.findUnique({
      where: { semanticScholarId },
    })
    if (researcher) return researcher
  }

  return null
}

/**
 * Updates existing researcher with fresh data from re-ingestion.
 * Only updates non-null fields and refreshes lastRefreshedAt timestamp.
 * 
 * @param researcherId - Researcher to update
 * @param updateData - Fields to update (all optional)
 */
async function updateExistingResearcher(
  existingResearcher: NonNullable<Awaited<ReturnType<typeof findExistingResearcher>>>,
  updateData: ReturnType<typeof normalizeIngestionData>
) {
  const { update, shouldQueue } = buildResearcherUpdate(existingResearcher, updateData)

  await prisma.researcher.update({
    where: { id: existingResearcher.id },
    data: update,
  })

  return shouldQueue
}

function buildResearcherUpdate(
  existingResearcher: NonNullable<Awaited<ReturnType<typeof findExistingResearcher>>>,
  data: ReturnType<typeof normalizeIngestionData>
) {
  const emailWasAdded = !!data.institutionalEmail && !existingResearcher.institutionalEmail
  const update = {
    lastRefreshedAt: new Date(),
    ...(data.firstName && !existingResearcher.firstName ? { firstName: data.firstName } : {}),
    ...(data.lastName && !existingResearcher.lastName ? { lastName: data.lastName } : {}),
    ...(data.institution && !existingResearcher.institution ? { institution: data.institution } : {}),
    ...(data.department && !existingResearcher.department ? { department: data.department } : {}),
    ...(data.institutionalEmail && !existingResearcher.institutionalEmail ? { institutionalEmail: data.institutionalEmail } : {}),
    ...(data.orcidId && !existingResearcher.orcidId ? { orcidId: data.orcidId } : {}),
    ...(data.openAlexId && !existingResearcher.openAlexId ? { openAlexId: data.openAlexId } : {}),
    ...(data.semanticScholarId && !existingResearcher.semanticScholarId ? { semanticScholarId: data.semanticScholarId } : {}),
    ...(data.sourceId && !existingResearcher.sourceId ? { sourceId: data.sourceId } : {}),
    ...(data.rawData !== undefined ? { rawData: data.rawData } : {}),
    ...(emailWasAdded && existingResearcher.article14Status === 'NOT_REQUIRED'
      ? { article14Status: 'PENDING' as Article14Status, article14Attempts: 0, article14LastError: null, article14JobId: null }
      : {}),
  }

  return {
    update,
    shouldQueue: emailWasAdded && existingResearcher.article14Status === 'NOT_REQUIRED',
  }
}

async function createResearcher(data: ReturnType<typeof normalizeIngestionData>) {
  try {
    const researcher = await prisma.researcher.create({
      data: {
        fullName: data.fullName,
        firstName: data.firstName,
        lastName: data.lastName,
        institutionalEmail: data.institutionalEmail,
        institution: data.institution,
        department: data.department,
        orcidId: data.orcidId,
        openAlexId: data.openAlexId,
        semanticScholarId: data.semanticScholarId,
        source: data.source,
        sourceId: data.sourceId,
        rawData: data.rawData,
        article14Status: data.institutionalEmail ? 'PENDING' : 'NOT_REQUIRED',
      },
    })
    return { researcher, wasCreated: true }
  } catch (err) {
    if (!isUniqueConstraintError(err)) throw err
    const existingResearcher = await findExistingResearcher(data)
    if (!existingResearcher) throw err
    const shouldQueue = await updateExistingResearcher(existingResearcher, data)
    if (shouldQueue) {
      await queueNotificationForResearcher(
        existingResearcher.id,
        data.institutionalEmail!,
        data.fullName,
        data.source,
        data.institution
      )
    }
    return { researcher: existingResearcher, wasCreated: false }
  }
}

function isUniqueConstraintError(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002'
}

/**
 * Queues Article 14 notification for new researcher with email.
 * Attempts queue first, falls back to synchronous send on failure.
 * Uses Prisma transaction to ensure DB consistency with queue enqueue.
 * 
 * Note: True atomicity between BullMQ and Prisma is not possible since
 * they are separate systems. We handle this by:
 * 1. Enqueueing job first (irreversible)
 * 2. Updating DB within transaction (rollback on failure)
 * 3. Throwing error if DB update fails after job enqueue (orphaned job logged)
 * 
 * @param researcherId - Researcher ID to notify
 * @param email - Researcher's institutional email
 * @param fullName - Researcher's full name
 * @param source - Researcher data source
 * @param institution - Researcher's institution (optional)
 */
async function queueNotificationForResearcher(
  researcherId: string,
  email: string,
  fullName: string,
  source: ResearcherSource,
  institution?: string
) {
  const job = await addArticle14Job(researcherId, email, fullName, source)

  if (job) {
    try {
      await prisma.$transaction([
        prisma.researcher.update({
          where: { id: researcherId },
          data: {
            article14JobId: job.id?.toString(),
          },
        }),
      ])

      info('Article 14 notification job enqueued', {
        researcherId,
        jobId: job.id,
      })
    } catch (dbError) {
      const errorMessage = dbError instanceof Error ? dbError.message : String(dbError)
      error('DB update failed after job enqueue - orphaned job may exist', {
        researcherId,
        jobId: job.id,
        error: errorMessage,
      })
      throw new Error('Failed to update researcher after job enqueue')
    }
  } else {
    await attemptSynchronousFallback(researcherId, email, fullName, institution)
  }
}

/**
 * Attempts synchronous Article 14 email send when queue is unavailable.
 * Updates researcher record with success or failure status.
 * 
 * @param researcherId - Researcher ID to notify
 * @param email - Researcher's institutional email
 * @param fullName - Researcher's full name
 * @param institution - Researcher's institution (optional)
 */
async function attemptSynchronousFallback(
  researcherId: string,
  email: string,
  fullName: string,
  institution?: string
) {
  warn('Failed to enqueue Article 14 notification, attempting synchronous fallback', {
    researcherId,
  })

  const researcher = await prisma.researcher.findUnique({
    where: { id: researcherId },
  })

  if (!researcher) {
    throw new Error(`Researcher not found: ${researcherId}`)
  }

  const sendResult = await sendArticle14Email(
    email,
    fullName,
    {
      researcherName: fullName,
      institution: institution || undefined,
      ingestionDate: researcher.firstIngestedAt.toISOString().split('T')[0],
    }
  )

  if (sendResult.success) {
    await prisma.researcher.update({
      where: { id: researcherId },
      data: {
        article14Status: 'SENT',
        article14NotifiedAt: new Date(),
        article14JobId: sendResult.messageId || 'sync-fallback',
      },
    })
  } else {
    await prisma.researcher.update({
      where: { id: researcherId },
      data: {
        article14Attempts: 1,
        article14LastError: sendResult.error || 'Queue unavailable and synchronous send failed',
        article14Status: 'FAILED',
      },
    })
  }
}
