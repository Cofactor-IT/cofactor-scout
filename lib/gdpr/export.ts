/**
 * GDPR Export Generation
 * Handles user data export for portability requests
 */

import { prisma } from '@/lib/database/prisma'
import { createHash } from 'crypto'
import { writeFile, mkdir, unlink } from 'fs/promises'
import { join } from 'path'
import { logger } from '@/lib/logger'
import { userDataMap, relatedEntities } from './data-mapper'

const EXPORT_DIR = process.env.GDPR_EXPORT_DIR || './tmp/gdpr-exports'
const EXPORT_RETENTION_DAYS = 7

export interface ExportData {
    exportMetadata: {
        generatedAt: string
        userId: string
        version: string
        format: 'json' | 'csv' | 'both'
    }
    profile: Record<string, unknown>
    wikiRevisions: unknown[]

    notifications: unknown[]
    bookmarks: unknown[]
    calendarEvents: unknown[]
    customFieldValues: unknown[]
    pageVersions: unknown[]
    experimentAssignments: unknown[]
    preferences: {
        notification: unknown | null
        user: unknown | null
    }
}

export async function generateUserExport(
    userId: string,
    format: 'json' | 'csv' | 'both' = 'both'
): Promise<{ jsonPath?: string; csvPath?: string; exportId: string }> {
    const startTime = Date.now()

    try {
        // Fetch all user data
        const userData = await fetchCompleteUserData(userId)

        // Create export directory if it doesn't exist
        await mkdir(EXPORT_DIR, { recursive: true })

        const exportId = createHash('sha256')
            .update(`${userId}-${Date.now()}-${Math.random()}`)
            .digest('hex')
            .substring(0, 32)

        const results: { jsonPath?: string; csvPath?: string; exportId: string } = { exportId }

        if (format === 'json' || format === 'both') {
            results.jsonPath = await generateJSONExport(userData, exportId)
        }

        if (format === 'csv' || format === 'both') {
            results.csvPath = await generateCSVExport(userData, exportId)
        }

        // Schedule cleanup
        scheduleExportCleanup(exportId)

        logger.info('GDPR export generated', {
            userId,
            exportId,
            format,
            duration: Date.now() - startTime
        })

        return results
    } catch (error) {
        logger.error('Failed to generate GDPR export', { userId, error: error instanceof Error ? error.message : String(error) })
        throw new Error('Export generation failed')
    }
}

async function fetchCompleteUserData(userId: string): Promise<ExportData> {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            revisions: {
                include: {
                    uniPage: {
                        select: { name: true, slug: true }
                    }
                },
                orderBy: { createdAt: 'desc' }
            },

            notifications: {
                orderBy: { createdAt: 'desc' }
            },
            bookmarks: {
                include: {
                    page: {
                        select: { name: true, slug: true }
                    }
                }
            },
            calendarEvents: {
                orderBy: { startTime: 'desc' }
            },
            customFieldValues: {
                include: {
                    field: true
                }
            },
            pageVersions: {
                include: {
                    uniPage: {
                        select: { name: true, slug: true }
                    }
                },
                orderBy: { createdAt: 'desc' }
            },
            experimentAssignments: {
                include: {
                    experiment: true
                }
            },
            notificationPreference: true,
            userPreference: true,
            university: {
                select: { name: true }
            },
            secondaryUniversity: {
                select: { name: true }
            }
        }
    })

    if (!user) {
        throw new Error('User not found')
    }

    // Sanitize sensitive data
    const sanitizedUser = {
        ...user,
        password: '[REDACTED_FOR_SECURITY]',
        verificationToken: user.verificationToken ? '[REDACTED]' : null
    }

    return {
        exportMetadata: {
            generatedAt: new Date().toISOString(),
            userId: user.id,
            version: '1.0',
            format: 'json'
        },
        profile: {
            id: sanitizedUser.id,
            email: sanitizedUser.email,
            name: sanitizedUser.name,
            bio: sanitizedUser.bio,
            role: sanitizedUser.role,

            emailVerified: sanitizedUser.emailVerified,

            createdAt: sanitizedUser.createdAt,
            updatedAt: sanitizedUser.updatedAt,
            university: sanitizedUser.university,
            secondaryUniversity: sanitizedUser.secondaryUniversity
        },
        wikiRevisions: sanitizedUser.revisions.map(rev => ({
            id: rev.id,
            pageName: rev.uniPage?.name,
            pageSlug: rev.uniPage?.slug,
            content: rev.content,
            status: rev.status,
            createdAt: rev.createdAt
        })),

        notifications: sanitizedUser.notifications.map(notif => ({
            id: notif.id,
            type: notif.type,
            title: notif.title,
            message: notif.message,
            link: notif.link,
            read: notif.read,
            createdAt: notif.createdAt
        })),
        bookmarks: sanitizedUser.bookmarks.map(bookmark => ({
            id: bookmark.id,
            pageName: bookmark.page?.name,
            pageSlug: bookmark.page?.slug,
            note: bookmark.note,
            createdAt: bookmark.createdAt
        })),
        calendarEvents: sanitizedUser.calendarEvents.map(event => ({
            id: event.id,
            title: event.title,
            description: event.description,
            startTime: event.startTime,
            endTime: event.endTime,
            location: event.location,
            type: event.type,
            createdAt: event.createdAt,
            updatedAt: event.updatedAt
        })),
        customFieldValues: sanitizedUser.customFieldValues.map(cfv => ({
            id: cfv.id,
            fieldKey: cfv.field.key,
            fieldLabel: cfv.field.label,
            fieldType: cfv.field.type,
            value: cfv.value,
            createdAt: cfv.createdAt,
            updatedAt: cfv.updatedAt
        })),
        pageVersions: sanitizedUser.pageVersions.map(pv => ({
            id: pv.id,
            pageName: pv.uniPage?.name,
            pageSlug: pv.uniPage?.slug,
            title: pv.title,
            content: pv.content,
            version: pv.version,
            createdAt: pv.createdAt
        })),
        experimentAssignments: sanitizedUser.experimentAssignments.map(ea => ({
            id: ea.id,
            experimentName: ea.experiment.name,
            experimentDescription: ea.experiment.description,
            variant: ea.variant,
            createdAt: ea.createdAt
        })),
        preferences: {
            notification: sanitizedUser.notificationPreference,
            user: sanitizedUser.userPreference
        }
    }
}

async function generateJSONExport(data: ExportData, exportId: string): Promise<string> {
    const filename = `gdpr-export-${exportId}.json`
    const filepath = join(EXPORT_DIR, filename)

    await writeFile(filepath, JSON.stringify(data, null, 2), 'utf-8')

    return filepath
}

async function generateCSVExport(data: ExportData, exportId: string): Promise<string> {
    const filename = `gdpr-export-${exportId}.csv`
    const filepath = join(EXPORT_DIR, filename)

    const csvSections: string[] = []

    // Profile section
    csvSections.push('PROFILE')
    csvSections.push('Field,Value')
    Object.entries(data.profile).forEach(([key, value]) => {
        const sanitizedValue = typeof value === 'object' ? JSON.stringify(value) : String(value)
        csvSections.push(`"${key}","${sanitizedValue.replace(/"/g, '""')}"`)
    })

    // Wiki Revisions
    if (data.wikiRevisions.length > 0) {
        csvSections.push('\nWIKI_REVISIONS')
        csvSections.push('ID,Page Name,Page Slug,Content,Status,Created At')
        data.wikiRevisions.forEach((rev: any) => {
            csvSections.push(`"${rev.id}","${rev.pageName}","${rev.pageSlug}","${(rev.content || '').substring(0, 100).replace(/"/g, '""')}...","${rev.status}","${rev.createdAt}"`)
        })
    }

    // Notifications
    if (data.notifications.length > 0) {
        csvSections.push('\nNOTIFICATIONS')
        csvSections.push('ID,Type,Title,Message,Link,Read,Created At')
        data.notifications.forEach((notif: any) => {
            csvSections.push(`"${notif.id}","${notif.type}","${(notif.title || '').replace(/"/g, '""')}","${(notif.message || '').replace(/"/g, '""')}","${notif.link || ''}","${notif.read}","${notif.createdAt}"`)
        })
    }

    // Bookmarks
    if (data.bookmarks.length > 0) {
        csvSections.push('\nBOOKMARKS')
        csvSections.push('ID,Page Name,Page Slug,Note,Created At')
        data.bookmarks.forEach((bm: any) => {
            csvSections.push(`"${bm.id}","${bm.pageName}","${bm.pageSlug}","${(bm.note || '').replace(/"/g, '""')}","${bm.createdAt}"`)
        })
    }

    // Calendar Events
    if (data.calendarEvents.length > 0) {
        csvSections.push('\nCALENDAR_EVENTS')
        csvSections.push('ID,Title,Description,Start Time,End Time,Location,Type,Created At')
        data.calendarEvents.forEach((evt: any) => {
            csvSections.push(`"${evt.id}","${(evt.title || '').replace(/"/g, '""')}","${(evt.description || '').replace(/"/g, '""')}","${evt.startTime}","${evt.endTime}","${evt.location || ''}","${evt.type}","${evt.createdAt}"`)
        })
    }



    // Data mapping info
    csvSections.push('\n\nDATA_CATEGORIES')
    csvSections.push('Category,Description,Fields,Sensitive,Retention,Purpose')
    Object.entries(userDataMap).forEach(([key, category]) => {
        csvSections.push(`"${key}","${category.description}","${category.fields.join(', ')}","${category.sensitive}","${category.retention}","${category.purpose}"`)
    })

    await writeFile(filepath, csvSections.join('\n'), 'utf-8')

    return filepath
}

function scheduleExportCleanup(exportId: string): void {
    // Schedule cleanup after retention period
    const cleanupDelay = EXPORT_RETENTION_DAYS * 24 * 60 * 60 * 1000

    setTimeout(async () => {
        try {
            const jsonPath = join(EXPORT_DIR, `gdpr-export-${exportId}.json`)
            const csvPath = join(EXPORT_DIR, `gdpr-export-${exportId}.csv`)

            await unlink(jsonPath).catch(() => { })
            await unlink(csvPath).catch(() => { })

            logger.info('GDPR export files cleaned up', { exportId })
        } catch (error) {
            logger.error('Failed to cleanup GDPR export files', { exportId, error: error instanceof Error ? error.message : String(error) })
        }
    }, cleanupDelay)
}

export async function cleanupOldExports(): Promise<void> {
    // This can be called periodically to clean up any missed exports
    const { readdir, stat } = await import('fs/promises')

    try {
        const files = await readdir(EXPORT_DIR)
        const now = Date.now()
        const maxAge = EXPORT_RETENTION_DAYS * 24 * 60 * 60 * 1000

        for (const file of files) {
            if (file.startsWith('gdpr-export-')) {
                const filepath = join(EXPORT_DIR, file)
                const stats = await stat(filepath)

                if (now - stats.mtime.getTime() > maxAge) {
                    await unlink(filepath)
                    logger.info('Cleaned up old export file', { file })
                }
            }
        }
    } catch (error) {
        logger.error('Error during export cleanup', { error: error instanceof Error ? error.message : String(error) })
    }
}

export function getExportFilePath(exportId: string, format: 'json' | 'csv'): string {
    return join(EXPORT_DIR, `gdpr-export-${exportId}.${format}`)
}

export function validateExportId(exportId: string): boolean {
    // Export IDs should be 32 character hex strings
    return /^[a-f0-9]{32}$/.test(exportId)
}
