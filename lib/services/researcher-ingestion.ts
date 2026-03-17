import { prisma } from '@/lib/database/prisma'
import { addArticle14Job } from '@/lib/queues/article14.queue'
import { info, warn } from '@/lib/logger'
import { sendArticle14Email } from '@/lib/email/brevo'

type ResearcherSource = 'OPENALEX' | 'ORCID' | 'CROSSREF' | 'PUBMED' | 'SEMANTIC_SCHOLAR' | 'PATENTSVIEW' | 'MANUAL'

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
  rawData?: Record<string, unknown>
}

export async function processResearcherIngestion(
  data: ResearcherIngestionData
) {
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
    let existingResearcher = null

    if (institutionalEmail) {
      existingResearcher = await prisma.researcher.findUnique({
        where: { institutionalEmail },
      })
    }

    if (!existingResearcher && orcidId) {
      existingResearcher = await prisma.researcher.findUnique({
        where: { orcidId },
      })
    }

    if (!existingResearcher && openAlexId) {
      existingResearcher = await prisma.researcher.findUnique({
        where: { openAlexId },
      })
    }

    if (!existingResearcher && semanticScholarId) {
      existingResearcher = await prisma.researcher.findUnique({
        where: { semanticScholarId },
      })
    }

    if (existingResearcher) {
      const updated = await prisma.researcher.update({
        where: { id: existingResearcher.id },
        data: {
          lastRefreshedAt: new Date(),
          ...(firstName && { firstName }),
          ...(lastName && { lastName }),
          ...(institution && { institution }),
          ...(department && { department }),
          ...(rawData && { rawData: rawData as any }),
        },
      })

      info('Researcher already exists, updated lastRefreshedAt', {
        researcherId: existingResearcher.id,
        fullName,
      })

      return updated
    }

    const article14Status = institutionalEmail ? 'PENDING' : 'NOT_REQUIRED'

    const newResearcher = await prisma.researcher.create({
      data: {
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
        rawData: rawData as any,
        article14Status,
      },
    })

    info('Created new researcher', {
      researcherId: newResearcher.id,
      fullName,
      source,
      article14Status,
    })

    if (institutionalEmail) {
      const job = await addArticle14Job(
        newResearcher.id,
        institutionalEmail,
        fullName,
        source
      )

      if (job) {
        await prisma.researcher.update({
          where: { id: newResearcher.id },
          data: {
            article14JobId: job.id?.toString(),
          },
        })

        info('Article 14 notification job enqueued', {
          researcherId: newResearcher.id,
          jobId: job.id,
        })
      } else {
        warn('Failed to enqueue Article 14 notification, attempting synchronous fallback', {
          researcherId: newResearcher.id,
        })

        const sendResult = await sendArticle14Email(
          institutionalEmail,
          fullName,
          {
            researcherName: fullName,
            institution: institution || undefined,
            ingestionDate: newResearcher.firstIngestedAt.toISOString().split('T')[0],
          }
        )

        if (sendResult.success) {
          await prisma.researcher.update({
            where: { id: newResearcher.id },
            data: {
              article14Status: 'SENT',
              article14NotifiedAt: new Date(),
              article14JobId: sendResult.messageId || 'sync-fallback',
            },
          })
        } else {
          await prisma.researcher.update({
            where: { id: newResearcher.id },
            data: {
              article14Attempts: 1,
              article14LastError: sendResult.error || 'Queue unavailable and synchronous send failed',
              article14Status: 'FAILED',
            },
          })
        }
      }
    }

    return newResearcher
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    info('Error processing researcher ingestion', {
      fullName,
      source,
      error: errorMessage,
    })
    throw error
  }
}
