import { BrevoClient } from '@getbrevo/brevo'
import { logger, maskEmail } from '@/lib/logger'

interface Article14EmailParams {
  researcherName: string
  institution?: string
  ingestionDate: string
}

interface Article14SendResult {
  success: boolean
  messageId?: string
  error?: string
}

let client: BrevoClient | null = null

function getClient(): BrevoClient | null {
  if (!client && process.env.BREVO_API_KEY) {
    client = new BrevoClient({
      apiKey: process.env.BREVO_API_KEY,
    })
  }
  return client
}

function getSenderEmail(): string {
  return process.env.BREVO_SENDER_EMAIL || 'gdpr@cofactor.world'
}

function getSenderName(): string {
  return process.env.BREVO_SENDER_NAME || 'Cofactor Club'
}

function getTemplateId(): number | null {
  const templateId = process.env.BREVO_ARTICLE14_TEMPLATE_ID

  if (!templateId) {
    return null
  }

  const parsedTemplateId = parseInt(templateId, 10)
  return Number.isNaN(parsedTemplateId) ? null : parsedTemplateId
}

export function isBrevoConfigured(): boolean {
  return !!process.env.BREVO_API_KEY
}

export async function sendArticle14Email(
  to: string,
  researcherName: string,
  params: Article14EmailParams
): Promise<Article14SendResult> {
  logger.info('sendArticle14Email called', { to: maskEmail(to), researcherName })

  if (!isBrevoConfigured()) {
    logger.warn('Brevo not configured, skipping Article 14 email', { to: maskEmail(to) })
    return { success: false, error: 'Brevo not configured' }
  }

  const client = getClient()
  if (!client) {
    const error = 'Failed to initialize Brevo client'
    logger.error(error, { to: maskEmail(to) })
    return { success: false, error }
  }

  const templateId = getTemplateId()
  const senderEmail = getSenderEmail()
  const senderName = getSenderName()

  if (!templateId) {
    const error = 'BREVO_ARTICLE14_TEMPLATE_ID is not configured'
    logger.warn('Article 14 email template is not configured', {
      to: maskEmail(to),
    })
    return { success: false, error }
  }

  const emailParams = {
    sender: {
      email: senderEmail,
      name: senderName,
    },
    to: [{ email: to, name: researcherName }],
    templateId,
    params: {
      researcherName: params.researcherName,
      institution: params.institution || '',
      ingestionDate: params.ingestionDate,
    },
  }

  try {
    const response = await client.transactionalEmails.sendTransacEmail(emailParams)
    const messageId = response.messageId?.toString() || response.messageIds?.[0]

    if (!messageId) {
      logger.warn('Brevo accepted Article 14 request without message id', {
        to: maskEmail(to),
      })
    }

    logger.info('Article 14 email sent successfully via Brevo', {
      to: maskEmail(to),
      messageId,
    })
    return {
      success: true,
      messageId,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logger.error('Failed to send Article 14 email via Brevo', {
      to: maskEmail(to),
      error: errorMessage,
    }, error instanceof Error ? error : new Error(errorMessage))
    return { success: false, error: errorMessage }
  }
}
