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
  const {
    fullName,
    firstName,
    lastName,
    institutionalEmail,
    institution,
    department,
    orcidId,
    openAlexId,
    semanticScholarId,
    source,
    sourceId,
    rawData,
  } = data

  info('Processing researcher ingestion', {
    fullName,
    email: institutionalEmail ? '**REDACTED**' : undefined,
    source,
  })

  try {
    const existingResearcher = await findExistingResearcher({
      institutionalEmail,
      orcidId,
      openAlexId,
      semanticScholarId,
    })

    if (existingResearcher) {
      await updateExistingResearcher(existingResearcher.id, {
        firstName,
        lastName,
        institution,
        department,
        rawData,
      })

      info('Researcher already exists, updated lastRefreshedAt', {
        researcherId: existingResearcher.id,
        fullName,
      })

      return { researcherId: existingResearcher.id, wasCreated: false }
    }

    const article14Status = institutionalEmail ? ('PENDING' as Article14Status) : ('NOT_REQUIRED' as Article14Status)

    const newResearcher = await createNewResearcher({
      fullName,
      firstName,
      lastName,
      institutionalEmail,
      institution,
      department,
      orcidId,
      openAlexId,
      semanticScholarId,
      source,
      sourceId,
      rawData,
      article14Status,
    })

    info('Created new researcher', {
      researcherId: newResearcher.id,
      fullName,
      source,
      article14Status,
    })

    if (institutionalEmail) {
      await queueNotificationForResearcher(newResearcher.id, institutionalEmail, fullName, source, institution)
    }

    return { researcherId: newResearcher.id, wasCreated: true }
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
  researcherId: string,
  updateData: {
    firstName?: string
    lastName?: string
    institution?: string
    department?: string
    rawData?: Prisma.InputJsonValue
  }
) {
  const { firstName, lastName, institution, department, rawData } = updateData

  await prisma.researcher.update({
    where: { id: researcherId },
    data: {
      lastRefreshedAt: new Date(),
      ...(firstName && { firstName }),
      ...(lastName && { lastName }),
      ...(institution && { institution }),
      ...(department && { department }),
      ...(rawData && { rawData }),
    },
  })
}

/**
 * Creates new researcher record with Article 14 status tracking.
 * 
 * @param data - Complete researcher creation data
 * @returns Created researcher record
 */
async function createNewResearcher(data: {
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
  article14Status: Article14Status
}) {
  return await prisma.researcher.create({
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
      article14Status: data.article14Status,
    },
  })
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
