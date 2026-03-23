/**
 * privacy-request.actions.ts
 *
 * Server Actions for data subject rights request submission.
 * Public form (no authentication required) with rate limiting and duplicate detection.
 *
 * All actions validate input with Zod before database operations.
 * Sends acknowledgement email via nodemailer now, Brevo template later.
 */

'use server'

import { dataSubjectRequestSchema, type DataSubjectRequestInput } from '@/lib/validation/schemas'
import { createDataSubjectRequest, findPendingRequestsByEmail, markRequestAsNotified } from '@/lib/database/queries/data-subject-requests'
import { sendDataSubjectRequestAcknowledgementEmail } from '@/lib/email/send'
import { sendDataSubjectRequestAcknowledgementBrevoEmail } from '@/lib/email/brevo'
import { checkRateLimitRedis } from '@/lib/security/rate-limit-redis'
import { revalidatePath } from 'next/cache'
import { logger, maskEmail } from '@/lib/logger'

const MAX_REQUESTS_PER_DAY = 3
const RATE_LIMIT_WINDOW_MS = 24 * 60 * 60 * 1000 // 24 hours
/**
 * Submits a new data subject rights request.
 * No authentication required (public form).
 * Validates input, checks rate limits, detects duplicates, sends emails.
 *
 * @param data - Request data with all fields
 * @returns Success with request ID, or error with field-level issues
 */
export async function submitDataSubjectRequest(data: unknown) {
  const validated = dataSubjectRequestSchema.safeParse(data)

  if (!validated.success) {
    return {
      success: false,
      errors: validated.error.flatten().fieldErrors
    }
  }

  const input = validated.data as DataSubjectRequestInput
  const forceSubmit = (data as { forceSubmit?: boolean })?.forceSubmit

  const rateLimitResult = await checkRateLimitRedis(input.email, { limit: MAX_REQUESTS_PER_DAY, window: RATE_LIMIT_WINDOW_MS })
  if (!rateLimitResult.success) {
    logger.warn('Rate limit exceeded for data subject request', { email: maskEmail(input.email) })
    return {
      success: false,
      errors: {
        email: ['Too many requests. Please wait 24 hours before submitting another.']
      }
    }
  }

  if (!forceSubmit) {
    const pendingRequests = await findPendingRequestsByEmail(input.email)
    if (pendingRequests.length > 0) {
      logger.warn('Duplicate data subject request detected', {
        email: maskEmail(input.email),
        existingCount: pendingRequests.length
      })
      return {
        success: false,
        warning: 'You have a pending request. We will respond within 30 days.',
        duplicateRequestId: pendingRequests[0].requestId
      }
    }
  }

  try {
    const request = await createDataSubjectRequest({
      fullName: input.fullName,
      email: input.email,
      orcid: input.orcid,
      requestType: input.requestType,
      context: input.context,
    })

    logger.info('Data subject request created', {
      requestId: request.requestId,
      email: maskEmail(input.email),
      requestType: input.requestType
    })

    const requestTypeLabels: Record<string, string> = {
      REMOVE_MY_DATA: 'Request deletion of my data',
      OBJECT_TO_PROCESSING: 'Object to processing of my data',
      CORRECT_MY_DATA: 'Request correction of my data',
      ACCESS_MY_DATA: 'Request access to my data'
    }

    await sendDataSubjectRequestAcknowledgementBrevoEmail(
      input.email,
      input.fullName,
      request.requestId,
      requestTypeLabels[input.requestType]
    )

    await markRequestAsNotified(request.requestId)

    revalidatePath('/privacy/request')

    return {
      success: true,
      requestId: request.requestId,
      message: 'Your request has been submitted successfully.'
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    logger.error('Failed to submit data subject request', {
      email: maskEmail(input.email),
      error: errorMessage
    }, error instanceof Error ? error : new Error(errorMessage))

    return {
      success: false,
      errors: {
        form: ['Failed to submit request. Please try again or contact privacy@cofactor.world']
      }
    }
  }
}
