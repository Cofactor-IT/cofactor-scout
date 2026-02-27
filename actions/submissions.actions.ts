/**
 * Submissions Actions
 * 
 * Server actions for retrieving user's research submissions.
 */
'use server'

import { requireAuth } from '@/lib/auth/session'
import { findSubmissionsByUserId } from '@/lib/database/queries/submissions'

/**
 * Get all submissions for the authenticated user
 * 
 * @returns Array of user's research submissions
 */
export async function getMySubmissions() {
    const user = await requireAuth()
    return await findSubmissionsByUserId(user.id)
}
