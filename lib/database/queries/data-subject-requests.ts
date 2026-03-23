/**
 * data-subject-requests.ts
 *
 * Query functions for data subject rights requests.
 * Handles creation, retrieval, status updates, and retention for GDPR compliance.
 *
 * All queries are scoped appropriately and use select to limit returned fields.
 */

import { prisma } from '@/lib/database/prisma'
import { DataSubjectRequestType, DataSubjectRequestStatus } from '@prisma/client'

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Generates human-readable request ID (DSR-YYYY-NNNNN).
 * Uses transaction to ensure uniqueness and sequential numbering.
 *
 * @returns Generated request ID
 */
async function generateRequestId(): Promise<string> {
  const currentYear = new Date().getFullYear()

  const result = await prisma.$transaction(async (tx) => {
    let sequence = await tx.dataSubjectRequestSequence.findUnique({
      where: { year: currentYear }
    })

    if (!sequence) {
      sequence = await tx.dataSubjectRequestSequence.create({
        data: { year: currentYear, nextId: 1 }
      })
    }

    const requestId = `DSR-${currentYear}-${String(sequence.nextId).padStart(5, '0')}`

    await tx.dataSubjectRequestSequence.update({
      where: { year: currentYear },
      data: { nextId: { increment: 1 } }
    })

    return requestId
  })

  return result
}

// ============================================
// QUERY FUNCTIONS
// ============================================

/**
 * Creates a new data subject rights request.
 * Generates human-readable request ID and sets initial status to PENDING.
 *
 * @param data - Request data including name, email, ORCID, type, context
 * @returns Created request record with selected fields
 */
export async function createDataSubjectRequest(data: {
  fullName: string
  email: string
  orcid?: string | null
  requestType: DataSubjectRequestType
  context?: string | null
}) {
  const requestId = await generateRequestId()

  return await prisma.dataSubjectRequest.create({
    data: {
      requestId,
      fullName: data.fullName,
      email: data.email,
      orcid: data.orcid,
      requestType: data.requestType,
      context: data.context,
      status: 'PENDING',
      source: 'WEB_FORM',
      receivedAt: new Date(),
    },
    select: {
      id: true,
      requestId: true,
      fullName: true,
      email: true,
      requestType: true,
      status: true,
      receivedAt: true,
    },
  })
}

/**
 * Finds pending requests by email address within last 30 days.
 * Used for duplicate detection before accepting new requests.
 *
 * @param email - Email address to check
 * @returns Array of pending requests or empty array
 */
export async function findPendingRequestsByEmail(email: string) {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

  return await prisma.dataSubjectRequest.findMany({
    where: {
      email,
      status: {
        in: ['PENDING', 'IN_PROGRESS'],
      },
      receivedAt: {
        gte: thirtyDaysAgo,
      },
      deletedAt: null,
    },
    select: {
      id: true,
      requestId: true,
      requestType: true,
      receivedAt: true,
      status: true,
    },
    orderBy: {
      receivedAt: 'desc',
    },
  })
}

/**
 * Updates request status to NOTIFIED after acknowledgement email sent.
 *
 * @param requestId - Request ID to update
 * @returns Updated request record
 */
export async function markRequestAsNotified(requestId: string) {
  return await prisma.dataSubjectRequest.update({
    where: { requestId },
    data: {
      status: 'NOTIFIED',
      notifiedAt: new Date(),
    },
    select: {
      id: true,
      requestId: true,
      status: true,
      notifiedAt: true,
    },
  })
}

/**
 * Finds requests eligible for retention cleanup.
 * Requests completed 5+ years ago or soft-deleted 1+ year ago.
 *
 * @returns Array of requests eligible for cleanup
 */
export async function findRequestsForCleanup() {
  const fiveYearsAgo = new Date(Date.now() - 5 * 365 * 24 * 60 * 60 * 1000)
  const oneYearAgo = new Date(Date.now() - 1 * 365 * 24 * 60 * 60 * 1000)

  return await prisma.dataSubjectRequest.findMany({
    where: {
      OR: [
        {
          status: 'COMPLETED',
          completedAt: { lte: fiveYearsAgo },
          deletedAt: null,
        },
        {
          deletedAt: { lte: oneYearAgo },
        },
      ],
    },
    select: {
      id: true,
      requestId: true,
      status: true,
      deletedAt: true,
    },
  })
}

/**
 * Soft deletes a request (marks as deleted but keeps record).
 * Used for completed requests after 5-year retention period.
 *
 * @param requestId - Request ID to soft delete
 */
export async function softDeleteRequest(requestId: string) {
  return await prisma.dataSubjectRequest.update({
    where: { requestId },
    data: {
      deletedAt: new Date(),
    },
  })
}

/**
 * Hard deletes a request (permanent removal).
 * Used for soft-deleted requests after 1-year audit period.
 *
 * @param id - Internal request ID to delete
 */
export async function hardDeleteRequest(id: string) {
  return await prisma.dataSubjectRequest.delete({
    where: { id },
  })
}
