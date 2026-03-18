/**
 * brevo.ts
 * 
 * Brevo (SendinBlue) transactional email service for Article 14 notifications.
 * Provides type-safe email sending with template-based messages for GDPR compliance.
 * 
 * Key responsibilities:
 * - Send Article 14 notification emails via Brevo API
 * - Validate Brevo configuration before sending
 * - Mask sensitive data (emails) in logs
 * - Return structured results for logging and error handling
 * 
 * Configuration required:
 * - BREVO_API_KEY: Brevo API key for authentication
 * - BREVO_ARTICLE14_TEMPLATE_ID: Template ID for Article 14 emails
 * - BREVO_SENDER_EMAIL: From email address
 * - BREVO_SENDER_NAME: From display name
 * 
 * @module
 */

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

/**
 * Retrieves or initializes Brevo API client.
 * Client is cached after first initialization.
 * 
 * @returns BrevoClient instance or null if not configured
 */
function getClient(): BrevoClient | null {
  if (!client && process.env.BREVO_API_KEY) {
    client = new BrevoClient({
      apiKey: process.env.BREVO_API_KEY,
    })
  }
  return client
}

/**
 * Retrieves sender email from environment or uses default.
 * 
 * @returns Sender email address
 */
function getSenderEmail(): string {
  return process.env.BREVO_SENDER_EMAIL || 'gdpr@cofactor.world'
}

/**
 * Retrieves sender name from environment or uses default.
 * 
 * @returns Sender display name
 */
function getSenderName(): string {
  return process.env.BREVO_SENDER_NAME || 'Cofactor Club'
}

/**
 * Retrieves and validates Article 14 template ID from environment.
 * 
 * @returns Parsed template ID as number, or null if invalid
 */
function getTemplateId(): number | null {
  const templateId = process.env.BREVO_ARTICLE14_TEMPLATE_ID

  if (!templateId) {
    return null
  }

  const parsedTemplateId = parseInt(templateId, 10)
  return Number.isNaN(parsedTemplateId) ? null : parsedTemplateId
}

/**
 * Checks if Brevo is properly configured for sending emails.
 * 
 * @returns True if BREVO_API_KEY is set
 */
export function isBrevoConfigured(): boolean {
  return !!process.env.BREVO_API_KEY
}

/**
 * Sends Article 14 notification email via Brevo transactional API.
 * Uses pre-configured template with researcher-specific parameters.
 * 
 * @param to - Recipient email address
 * @param researcherName - Full name of researcher (for personalization)
 * @param params - Email template parameters
 * @param params.researcherName - Researcher's name for template
 * @param params.institution - Researcher's institution (optional)
 * @param params.ingestionDate - Date of data ingestion (YYYY-MM-DD)
 * @returns Send result with success status, message ID, or error
 */
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
