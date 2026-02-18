'use server'

/**
 * DEPRECATED: This file contained wiki-related admin actions
 * The schema has been migrated to Cofactor Scout (research submission platform)
 * 
 * Removed models: WikiRevision, UniPage, Institute, Lab, SecondaryUniversityRequest
 * 
 * TODO: Implement new admin actions for:
 * - ResearchSubmission moderation
 * - User management
 * - System settings
 */

export async function approveRevision() {
    throw new Error('Wiki functionality has been removed. This action is no longer available.')
}

export async function rejectRevision() {
    throw new Error('Wiki functionality has been removed. This action is no longer available.')
}

export async function bulkApproveRevisions() {
    throw new Error('Wiki functionality has been removed. This action is no longer available.')
}

export async function bulkRejectRevisions() {
    throw new Error('Wiki functionality has been removed. This action is no longer available.')
}

export async function getPendingRevisionsWithModerationInfo() {
    throw new Error('Wiki functionality has been removed. This action is no longer available.')
}

export async function approveStaff() {
    throw new Error('Staff approval system has been removed.')
}

export async function rejectStaff() {
    throw new Error('Staff approval system has been removed.')
}

export async function deletePage() {
    throw new Error('Wiki functionality has been removed. This action is no longer available.')
}

export async function approveInstitute() {
    throw new Error('Institute management has been removed.')
}

export async function rejectInstitute() {
    throw new Error('Institute management has been removed.')
}

export async function approveLab() {
    throw new Error('Lab management has been removed.')
}

export async function rejectLab() {
    throw new Error('Lab management has been removed.')
}

export async function approveSecondaryUniversityRequest() {
    throw new Error('Secondary university feature has been removed.')
}

export async function rejectSecondaryUniversityRequest() {
    throw new Error('Secondary university feature has been removed.')
}
