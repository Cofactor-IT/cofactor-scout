'use server'

import { requireAuth } from '@/lib/auth/session'
import { findSubmissionsByUserId } from '@/lib/database/queries/submissions'

export async function getMySubmissions() {
    const user = await requireAuth()
    return await findSubmissionsByUserId(user.id)
}
