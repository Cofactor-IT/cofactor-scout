/**
 * scout.actions.ts
 * 
 * Server Actions for scout application submission and reminder system.
 * Handles both authenticated and unauthenticated application flows.
 * 
 * Scout applications expire after 30 days, allowing users to reapply.
 * Includes resume (required) and cover letter (optional) uploads.
 */

'use server'

import { UserRole } from '@prisma/client'
import { randomBytes } from 'crypto'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/database/prisma'
import { authOptions } from '@/lib/auth/config'
import { logger } from '@/lib/logger'

interface ScoutApplicationDraftRedirectData {
    draftToken: string
    name: string
    email: string
    university: string
}

interface ScoutApplicationResponse {
    error?: string
    success?: string
    data?: ScoutApplicationDraftRedirectData
}

interface UploadedDocument {
    fileName: string
    mimeType: string
    data: Buffer
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Generates a cryptographically secure random token.
 * 
 * @returns 64-character hexadecimal string (32 bytes)
 */
function generateSecureToken(): string {
    return randomBytes(32).toString('hex')
}

/**
 * Reads non-empty file entry from form data.
 */
function getUploadedFile(formData: FormData, key: string): File | null {
    const entry = formData.get(key)
    if (!entry || typeof entry === 'string') {
        return null
    }
    if (entry.size === 0 || !entry.name) {
        return null
    }
    return entry
}

/**
 * Normalizes optional text field from FormData.
 */
function getOptionalText(formData: FormData, key: string): string | null {
    const value = formData.get(key)
    if (typeof value !== 'string') {
        return null
    }
    const trimmed = value.trim()
    return trimmed.length > 0 ? trimmed : null
}

/**
 * Checks if the selected role maps to the UserRole enum.
 */
function isUserRole(value: string): value is UserRole {
    return value in UserRole
}

/**
 * Validates upload type and size for scout application documents.
 */
function getDocumentValidationError(file: File, label: string): string | null {
    const extension = file.name.toLowerCase().split('.').pop()
    const hasValidExtension = extension ? ALLOWED_FILE_EXTENSIONS.has(extension) : false
    const hasValidMimeType = !file.type || ALLOWED_FILE_MIME_TYPES.has(file.type)

    if (!hasValidExtension || !hasValidMimeType) {
        return `${label} must be a PDF, DOC, or DOCX file`
    }

    if (file.size > MAX_DOCUMENT_SIZE_BYTES) {
        return `${label} must be 5MB or smaller`
    }

    return null
}

/**
 * Converts uploaded file to binary document payload for persistence/email.
 */
async function toUploadedDocument(file: File): Promise<UploadedDocument> {
    const data = Buffer.from(await file.arrayBuffer())
    const extension = file.name.toLowerCase().split('.').pop()
    const fallbackMimeType = extension === 'pdf'
        ? 'application/pdf'
        : extension === 'doc'
            ? 'application/msword'
            : extension === 'docx'
                ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                : 'application/octet-stream'

    return {
        fileName: file.name,
        mimeType: file.type || fallbackMimeType,
        data
    }
}

// ============================================
// CONSTANTS
// ============================================

// Scout applications expire after 30 days, allowing reapplication
const ONE_MONTH_MS = 30 * 24 * 60 * 60 * 1000
// Unauthenticated scout application drafts expire after 24 hours
const DRAFT_EXPIRY_MS = 24 * 60 * 60 * 1000
// Uploaded scout application documents are limited to 5MB each
const MAX_DOCUMENT_SIZE_BYTES = 5 * 1024 * 1024
// Supported document MIME types for scout application uploads
const ALLOWED_FILE_MIME_TYPES = new Set([
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
])
// Supported document extensions for scout application uploads
const ALLOWED_FILE_EXTENSIONS = new Set(['pdf', 'doc', 'docx'])

// ============================================
// EXPORTED SERVER ACTIONS
// ============================================

/**
 * Sends reminder email to team about pending scout application.
 * Applications older than 30 days are considered expired.
 * No rate limiting on reminders in current implementation.
 * 
 * @returns Success message or error (APPLICATION_EXPIRED if > 30 days)
 * @throws {Error} If database query or email sending fails
 */
export async function sendScoutApplicationReminder(): Promise<{ error?: string; success?: string }> {
    try {
        // Always read userId from session, never from client input
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return { error: 'Not authenticated' }
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: {
                scoutApplicationStatus: true,
                scoutApplicationDate: true,
                fullName: true,
                email: true,
                university: true
            }
        })

        if (!user || user.scoutApplicationStatus !== 'PENDING') {
            return { error: 'No pending application found' }
        }

        if (!user.scoutApplicationDate) {
            return { error: 'Application date not found' }
        }

        const now = Date.now()
        const applicationAge = now - user.scoutApplicationDate.getTime()

        // Check if application is older than 30 days - allow reapplication
        if (applicationAge > ONE_MONTH_MS) {
            return { error: 'APPLICATION_EXPIRED' }
        }

        // Reminder rate limiting removed - users can send reminders anytime

        // Send reminder emails to team (it@cofactor.world, team@cofactor.world)
        const { sendScoutApplicationReminderEmail, sendReminderConfirmationEmail } = await import('@/lib/email/send')
        const daysSinceApplication = Math.floor(applicationAge / (24 * 60 * 60 * 1000))

        try {
            await sendScoutApplicationReminderEmail(
                user.fullName,
                user.email,
                user.university || 'Not specified',
                daysSinceApplication
            )
            await sendReminderConfirmationEmail(user.email, user.fullName)
            logger.info('Scout application reminder sent', { userId: session.user.id })
        } catch (err) {
            logger.error('Failed to send reminder emails', { error: err })
        }

        return { success: 'Reminder sent to team' }
    } catch (error) {
        logger.error('Send reminder failed', { error })
        return { error: 'Failed to send reminder' }
    }
}

/**
 * Submits scout application for authenticated or unauthenticated users.
 * Authenticated users: Updates existing account with application data.
 * Unauthenticated users: Returns data to redirect to signup flow.
 * 
 * Sends confirmation email to applicant and notification to team.
 * 
 * @param prevState - Previous form state (unused, required by useActionState)
 * @param formData - Form data with application fields
 * @returns Success/error message, or REDIRECT_TO_SIGNUP with application data
 * @throws {Error} If database operation fails
 */
export async function submitScoutApplication(
    _prevState: ScoutApplicationResponse | undefined,
    formData: FormData
): Promise<ScoutApplicationResponse> {
    try {
        const session = await getServerSession(authOptions)

        // Extract form data
        const name = getOptionalText(formData, 'name')
        // Normalize email to prevent duplicate accounts
        const email = getOptionalText(formData, 'email')?.toLowerCase()
        const university = getOptionalText(formData, 'university')
        const department = getOptionalText(formData, 'department')
        const linkedinUrl = getOptionalText(formData, 'linkedinUrl')
        const userRole = getOptionalText(formData, 'userRole')
        const userRoleOther = getOptionalText(formData, 'userRoleOther')
        const researchAreas = getOptionalText(formData, 'researchAreas')
        const whyScout = getOptionalText(formData, 'whyScout')
        const howSourceLeads = getOptionalText(formData, 'howSourceLeads')
        const resumeFile = getUploadedFile(formData, 'resume')
        const coverLetterFile = getUploadedFile(formData, 'coverLetter')

        // Validate required fields
        if (!name || !email || !university || !department || !userRole || !researchAreas || !whyScout || !howSourceLeads) {
            return { error: 'Please fill in all required fields' }
        }
        if (!isUserRole(userRole)) {
            return { error: 'Please select a valid role' }
        }
        if (userRole === 'OTHER' && !userRoleOther) {
            return { error: 'Please specify your role' }
        }
        if (!resumeFile) {
            return { error: 'Resume is required' }
        }

        const resumeError = getDocumentValidationError(resumeFile, 'Resume')
        if (resumeError) {
            return { error: resumeError }
        }
        if (coverLetterFile) {
            const coverLetterError = getDocumentValidationError(coverLetterFile, 'Cover letter')
            if (coverLetterError) {
                return { error: coverLetterError }
            }
        }

        const resume = await toUploadedDocument(resumeFile)
        const coverLetter = coverLetterFile ? await toUploadedDocument(coverLetterFile) : null

        let userId: string
        let userFullName: string

        if (session?.user?.id) {
            // Authenticated user flow - update existing account
            const user = await prisma.user.findUnique({
                where: { id: session.user.id },
                select: { scoutApplicationStatus: true, fullName: true }
            })

            if (!user) {
                return { error: 'User not found' }
            }

            if (user.scoutApplicationStatus !== 'NOT_APPLIED') {
                return { error: 'You have already submitted a scout application' }
            }

            userId = session.user.id
            userFullName = user.fullName

            // Update user with scout application data and set status to PENDING
            await prisma.user.update({
                where: { id: userId },
                data: {
                    university,
                    department,
                    linkedinUrl: linkedinUrl || null,
                    userRole,
                    userRoleOther: userRole === 'OTHER' ? userRoleOther : null,
                    researchAreas,
                    whyScout,
                    howSourceLeads,
                    scoutResumeFileName: resume.fileName,
                    scoutResumeMimeType: resume.mimeType,
                    scoutResumeData: resume.data,
                    scoutCoverLetterFileName: coverLetter?.fileName ?? null,
                    scoutCoverLetterMimeType: coverLetter?.mimeType ?? null,
                    scoutCoverLetterData: coverLetter?.data ?? null,
                    scoutApplicationStatus: 'PENDING',
                    scoutApplicationDate: new Date()
                }
            })
        } else {
            // Unauthenticated user flow - redirect to signup with application data
            const existingUser = await prisma.user.findUnique({
                where: { email },
                select: { id: true }
            })

            if (existingUser) {
                return { error: 'An account with this email already exists. Please sign in first.' }
            }

            // Delete stale drafts for this email before creating a new one
            await prisma.scoutApplicationDraft.deleteMany({
                where: {
                    OR: [
                        { email },
                        { expiresAt: { lt: new Date() } }
                    ]
                }
            })

            const draftToken = generateSecureToken()
            await prisma.scoutApplicationDraft.create({
                data: {
                    token: draftToken,
                    name,
                    email,
                    university,
                    department,
                    linkedinUrl,
                    userRole,
                    userRoleOther: userRole === 'OTHER' ? userRoleOther : null,
                    researchAreas,
                    whyScout,
                    howSourceLeads,
                    resumeFileName: resume.fileName,
                    resumeMimeType: resume.mimeType,
                    resumeData: resume.data,
                    coverLetterFileName: coverLetter?.fileName ?? null,
                    coverLetterMimeType: coverLetter?.mimeType ?? null,
                    coverLetterData: coverLetter?.data ?? null,
                    expiresAt: new Date(Date.now() + DRAFT_EXPIRY_MS)
                }
            })

            // Return token + minimal display data for signup handoff
            return {
                success: 'REDIRECT_TO_SIGNUP',
                data: {
                    draftToken,
                    name,
                    email,
                    university
                }
            }
        }

        // Send confirmation email to applicant
        const { sendScoutApplicationConfirmationEmail, sendScoutApplicationNotificationEmail } = await import('@/lib/email/send')
        try {
            await sendScoutApplicationConfirmationEmail(email, userFullName)
            logger.info('Scout application confirmation email sent', { email })

            // Send notification to team (it@cofactor.world, team@cofactor.world)
            await sendScoutApplicationNotificationEmail(
                userFullName,
                email,
                university,
                department,
                userRole,
                researchAreas,
                whyScout,
                howSourceLeads,
                linkedinUrl,
                resume.fileName,
                coverLetter?.fileName ?? null,
                new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
            )
            logger.info('Scout application notification sent to team', { email })
        } catch (err) {
            logger.error('Failed to send scout application emails', { email, error: err })
        }

        logger.info('Scout application submitted', { userId, email })

        return { success: 'Application submitted successfully' }
    } catch (error) {
        logger.error('Scout application submission failed', { error })
        return { error: 'Failed to submit application. Please try again.' }
    }
}
