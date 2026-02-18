/**
 * DEPRECATED: WikiRevision model has been removed
 */
export async function calculateReputation(_userId?: string) {
    return { score: 0, level: 'New', canAutoApprove: false, requiresExtraReview: false }
}

export async function updateReputationAfterModeration() {
    return
}
