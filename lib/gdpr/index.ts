/**
 * GDPR Module - Data Protection and Privacy Compliance
 * 
 * This module provides GDPR-compliant data export and deletion functionality
 * for the Cofactor Club platform.
 * 
 * @module gdpr
 */

// Data mapping and documentation
export {
    userDataMap,
    relatedEntities,
    getDataRetentionPolicy,
    getUserDataCategories,
    isSensitiveField,
    type DataRelationship,
    type UserDataMap
} from './data-mapper'

// Export generation
export {
    generateUserExport,
    cleanupOldExports,
    getExportFilePath,
    validateExportId,
    type ExportData
} from './export'

// Anonymization and deletion
export {
    anonymizeUser,
    generateDeletionToken,
    getDeletionWarnings,
    validateUserCanBeDeleted,
    type DeletionMode,
    type AnonymizationResult
} from './anonymize'

// Job queue
export {
    jobQueue,
    type Job,
    type JobType,
    type JobStatus
} from './queue'

// Audit logging
export {
    logGdprAction,
    logExportRequest,
    logExportDownload,
    logDeletionRequest,
    logDeletionConfirmation,
    logDeletionCompleted,
    logDataAccess,
    type GdprAction
} from './audit'
