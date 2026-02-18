/**
 * GDPR Anonymization Logic
 * Handles user data anonymization for right to be forgotten requests
 */

import { prisma } from '@/lib/database/prisma'
import { Prisma } from '@prisma/client'
import { createHash, randomBytes } from 'crypto'
import { logger } from '@/lib/logger'

export type DeletionMode = 'soft' | 'hard'

export interface AnonymizationResult {
    success: boolean
    userId: string
    mode: DeletionMode
    anonymizedAt: Date
    preservedContent: string[]
    deletedRecords: Record<string, number>
    errors?: string[]
}

interface AnonymizationContext {
    userId: string
    mode: DeletionMode
    anonymizedEmail: string
    anonymizedName: string
    errors: string[]
    deletedCounts: Record<string, number>
    preservedContent: string[]
}

const ANONYMIZED_EMAIL_DOMAIN = 'anonymized.local'

export async function anonymizeUser(
    userId: string,
    mode: DeletionMode = 'soft'
): Promise<AnonymizationResult> {
    const startTime = Date.now()

    logger.info('Starting user anonymization', { userId, mode })

    const context: AnonymizationContext = {
        userId,
        mode,
        anonymizedEmail: generateAnonymizedEmail(userId),
        anonymizedName: 'Anonymous User',
        errors: [],
        deletedCounts: {},
        preservedContent: []
    }

    try {
        if (mode === 'hard') {
            await performHardDelete(context)
        } else {
            await performSoftDelete(context)
        }

        logger.info('User anonymization completed', {
            userId,
            mode,
            duration: Date.now() - startTime,
            deletedRecords: context.deletedCounts
        })

        return {
            success: true,
            userId,
            mode,
            anonymizedAt: new Date(),
            preservedContent: context.preservedContent,
            deletedRecords: context.deletedCounts,
            errors: context.errors.length > 0 ? context.errors : undefined
        }
    } catch (error) {
        logger.error('User anonymization failed', {
            userId,
            mode,
            error: error instanceof Error ? error.message : String(error)
        })

        throw error
    }
}

async function performSoftDelete(context: AnonymizationContext): Promise<void> {
    const { userId, anonymizedEmail, anonymizedName } = context

    // 1. Anonymize the user record
    await prisma.user.update({
        where: { id: userId },
        data: {
            email: anonymizedEmail,
            name: anonymizedName,
            bio: null,

            password: null,


            verificationToken: null,
            verificationExpires: null,
            failedLoginAttempts: 0,
            lockedUntil: null,
            emailVerified: null
        }
    })

    // 2. Delete sensitive related records
    await deleteNotifications(context)
    await deletePasswordResetTokens(context)
    await deleteBookmarks(context)
    await deleteCalendarEvents(context)
    await deleteCustomFieldValues(context)
    await deleteExperimentAssignments(context)
    await deleteNotificationPreferences(context)
    await deleteUserPreferences(context)
    await deleteSecondaryUniversityRequests(context)
    await deleteImportJobs(context)
    await deleteExportJobs(context)



    // 4. Preserve but anonymize wiki content
    await anonymizeWikiRevisions(context)
    await anonymizePageVersions(context)

    context.preservedContent.push(
        'Wiki revisions (anonymized author)',
        'Page versions (anonymized author)'
    )
}

async function performHardDelete(context: AnonymizationContext): Promise<void> {
    const { userId } = context

    // Note: Hard delete may fail if there are referential integrity constraints
    // that aren't set to CASCADE. We handle this by catching errors and
    // potentially falling back to soft delete.

    try {
        // Delete user - this will cascade to all relations with onDelete: Cascade
        await prisma.user.delete({
            where: { id: userId }
        })

        context.deletedCounts['User'] = 1
    } catch (error) {
        // If hard delete fails (e.g., due to referential integrity),
        // log the error and suggest soft delete
        logger.warn('Hard delete failed, referential integrity constraints', {
            userId,
            error: error instanceof Error ? error.message : String(error)
        })

        context.errors.push('Hard delete failed due to data dependencies. Soft delete was performed instead.')

        // Fall back to soft delete
        await performSoftDelete(context)
    }
}

async function deleteNotifications(context: AnonymizationContext): Promise<void> {
    const result = await prisma.notification.deleteMany({
        where: { userId: context.userId }
    })
    context.deletedCounts['Notifications'] = result.count
}

async function deletePasswordResetTokens(context: AnonymizationContext): Promise<void> {
    const result = await prisma.passwordReset.deleteMany({
        where: { userId: context.userId }
    })
    context.deletedCounts['PasswordReset'] = result.count
}

async function deleteBookmarks(context: AnonymizationContext): Promise<void> {
    const result = await prisma.bookmark.deleteMany({
        where: { userId: context.userId }
    })
    context.deletedCounts['Bookmarks'] = result.count
}

async function deleteCalendarEvents(context: AnonymizationContext): Promise<void> {
    const result = await prisma.calendarEvent.deleteMany({
        where: { userId: context.userId }
    })
    context.deletedCounts['CalendarEvents'] = result.count
}

async function deleteCustomFieldValues(context: AnonymizationContext): Promise<void> {
    const result = await prisma.customFieldValue.deleteMany({
        where: { userId: context.userId }
    })
    context.deletedCounts['CustomFieldValues'] = result.count
}

async function deleteExperimentAssignments(context: AnonymizationContext): Promise<void> {
    const result = await prisma.experimentAssignment.deleteMany({
        where: { userId: context.userId }
    })
    context.deletedCounts['ExperimentAssignments'] = result.count
}

async function deleteNotificationPreferences(context: AnonymizationContext): Promise<void> {
    const result = await prisma.notificationPreference.deleteMany({
        where: { userId: context.userId }
    })
    context.deletedCounts['NotificationPreferences'] = result.count
}

async function deleteUserPreferences(context: AnonymizationContext): Promise<void> {
    const result = await prisma.userPreference.deleteMany({
        where: { userId: context.userId }
    })
    context.deletedCounts['UserPreferences'] = result.count
}

async function deleteSecondaryUniversityRequests(context: AnonymizationContext): Promise<void> {
    const result = await prisma.secondaryUniversityRequest.deleteMany({
        where: { userId: context.userId }
    })
    context.deletedCounts['SecondaryUniversityRequests'] = result.count
}

async function deleteImportJobs(context: AnonymizationContext): Promise<void> {
    const result = await prisma.importJob.deleteMany({
        where: { userId: context.userId }
    })
    context.deletedCounts['ImportJobs'] = result.count
}

async function deleteExportJobs(context: AnonymizationContext): Promise<void> {
    const result = await prisma.exportJob.deleteMany({
        where: { userId: context.userId }
    })
    context.deletedCounts['ExportJobs'] = result.count
}



async function anonymizeWikiRevisions(context: AnonymizationContext): Promise<void> {
    // Keep the revisions but change author to anonymous
    // The content is preserved but authorship is anonymized
    const result = await prisma.wikiRevision.updateMany({
        where: { authorId: context.userId },
        data: {
            // We keep the authorId as is - the user record is already anonymized
            // This maintains content integrity while protecting user identity
        }
    })

    context.deletedCounts['WikiRevisionsAnonymized'] = result.count
}

async function anonymizePageVersions(context: AnonymizationContext): Promise<void> {
    // Keep page versions but authorship is anonymized via the user record
    const result = await prisma.pageVersion.updateMany({
        where: { createdBy: context.userId },
        data: {
            // Content preserved, authorship anonymized via user record update
        }
    })

    context.deletedCounts['PageVersionsAnonymized'] = result.count
}

function generateAnonymizedEmail(userId: string): string {
    const hash = createHash('sha256')
        .update(`${userId}-${Date.now()}-${randomBytes(16).toString('hex')}`)
        .digest('hex')
        .substring(0, 16)

    return `anon_${hash}@${ANONYMIZED_EMAIL_DOMAIN}`
}



export function generateDeletionToken(): string {
    return randomBytes(32).toString('hex')
}

export function getDeletionWarnings(mode: DeletionMode): string[] {
    const commonWarnings = [
        'This action cannot be undone.',
        'You will lose access to your account immediately.',
        'Your contributions to the wiki will remain but be attributed to an anonymous user.',
        'Any pending requests or approvals will be cancelled.'
    ]

    if (mode === 'hard') {
        return [
            ...commonWarnings,
            'HARD DELETE MODE: All your data will be permanently removed.',
            'This includes all wiki edits, bookmarks, and activity history.',
            'Some data may be retained in encrypted backups for up to 30 days.',
            'If there are dependencies on your data, a soft delete may be performed instead.'
        ]
    }

    return [
        ...commonWarnings,
        'SOFT DELETE MODE: Your personal information will be anonymized.',
        'Your wiki contributions will remain but without attribution.',
        'This is the recommended option for maintaining content integrity.'
    ]
}

export async function validateUserCanBeDeleted(userId: string): Promise<{
    canDelete: boolean
    warnings: string[]
    contentCount: {
        wikiRevisions: number
        pageVersions: number
        bookmarks: number
    }
}> {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            _count: {
                select: {
                    revisions: true,
                    pageVersions: true,
                    bookmarks: true
                }
            }
        }
    })

    if (!user) {
        return {
            canDelete: false,
            warnings: ['User not found'],
            contentCount: { wikiRevisions: 0, pageVersions: 0, bookmarks: 0 }
        }
    }

    const warnings: string[] = []

    if (user.role === 'ADMIN') {
        warnings.push('You are an admin. Deleting your account may affect platform management.')
    }

    if (user._count.revisions > 0) {
        warnings.push(`You have ${user._count.revisions} wiki revisions that will be anonymized.`)
    }

    if (user._count.pageVersions > 0) {
        warnings.push(`You have ${user._count.pageVersions} page versions that will be anonymized.`)
    }

    return {
        canDelete: true,
        warnings,
        contentCount: {
            wikiRevisions: user._count.revisions,
            pageVersions: user._count.pageVersions,
            bookmarks: user._count.bookmarks
        }
    }
}
