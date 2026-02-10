/**
 * Content Moderation Module
 * Automated spam detection, content filtering, and reputation system
 */

export { spamDetectionConfig, getConfig, updateConfig, MODERATION_FEATURES } from './config'
export type { ModerationAction, SpamDetectionConfig } from './config'

export { detectSpam, calculateSimilarity } from './spam-detector'
export type { SpamAnalysis } from './spam-detector'

export { filterContent, maskPersonalInfo, getContentSummary } from './content-filter'
export type { FilterResult, FilterViolation } from './content-filter'

export { getUserReputation, shouldAutoApprove, shouldAutoFlag, recordSubmissionOutcome, getModerationPriority } from './reputation'
export type { UserReputation, ReputationFactors } from './reputation'

export { moderateContent } from './moderator'
export type { ModerationResult, ModerateContentOptions } from './moderator'
