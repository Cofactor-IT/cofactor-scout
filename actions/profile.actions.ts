'use server'

/**
 * DEPRECATED: This file contained secondary university management
 * The University and SecondaryUniversityRequest models have been removed
 * 
 * TODO: Implement new profile actions if needed
 */

export async function requestSecondaryUniversity() {
    throw new Error('Secondary university feature has been removed.')
}

export async function cancelSecondaryRequest() {
    throw new Error('Secondary university feature has been removed.')
}

export async function unlinkSecondaryUniversity() {
    throw new Error('Secondary university feature has been removed.')
}

export async function getApprovedUniversities() {
    return []
}

export async function getPendingRequest() {
    return null
}
