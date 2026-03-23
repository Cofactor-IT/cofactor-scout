/**
 * researchers.ts
 *
 * Query functions for researcher data.
 * Handles retrieval and status updates for researchers, supporting GDPR compliance and ingestion.
 */

import { prisma } from '@/lib/database/prisma'

/**
 * Retrieves a researcher by their ID.
 * 
 * @param id - The ID of the researcher
 * @returns The researcher record or null
 */
export async function getResearcherById(id: string) {
  return await prisma.researcher.findUnique({
    where: { id },
  })
}

/**
 * Resets a researcher's Article 14 status to PENDING.
 * Clears any previous errors and attempts.
 * 
 * @param id - The ID of the researcher
 * @returns The updated researcher record
 */
export async function resetResearcherArticle14Status(id: string) {
  return await prisma.researcher.update({
    where: { id },
    data: {
      article14Status: 'PENDING',
      article14Attempts: 0,
      article14LastError: null,
    },
  })
}
