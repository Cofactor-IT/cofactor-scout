import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/database/prisma'
import { checkRateLimit, getClientIp } from '@/lib/security/rate-limit'
import { logger } from '@/lib/logger'
import { generateDeletionToken, validateUserCanBeDeleted, getDeletionWarnings, DeletionMode } from '@/lib/gdpr/anonymize'
import { sendNotificationEmail } from '@/lib/email/send'
import { logDeletionRequest } from '@/lib/gdpr/audit'

const TOKEN_EXPIRY_HOURS = 24

export async function POST(request: NextRequest) {
    const requestId = crypto.randomUUID()
    logger.info('GDPR deletion request received', { requestId })
    
    try {
        // Authentication check
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            logger.warn('Unauthorized GDPR deletion request', { requestId })
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            )
        }
        
        const userId = session.user.id
        const clientIp = getClientIp(request)
        
        // Rate limiting - very strict for deletion requests
        const rateLimitKey = `gdpr_delete:${userId}:${clientIp}`
        const rateLimitResult = checkRateLimit(rateLimitKey, {
            limit: 2, // 2 deletion requests per window
            window: 24 * 60 * 60 * 1000 // 24 hours
        })
        
        if (!rateLimitResult.success) {
            logger.warn('GDPR deletion rate limit exceeded', { 
                requestId, 
                userId,
                resetTime: rateLimitResult.resetTime 
            })
            
            return NextResponse.json(
                { 
                    error: 'Rate limit exceeded',
                    message: 'Too many deletion requests. Please try again later.',
                    resetTime: rateLimitResult.resetTime
                },
                { status: 429 }
            )
        }
        
        // Parse request body
        const body = await request.json().catch(() => ({}))
        const mode: 'SOFT' | 'HARD' = body.mode === 'hard' ? 'HARD' : 'SOFT'
        
        // Validate user can be deleted
        const validation = await validateUserCanBeDeleted(userId)
        
        if (!validation.canDelete) {
            return NextResponse.json(
                { 
                    error: 'Cannot delete account',
                    warnings: validation.warnings
                },
                { status: 400 }
            )
        }
        
        // Get user details
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, email: true, name: true }
        })
        
        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            )
        }
        
        // Check for existing pending deletion request
        const existingRequest = await prisma.deletionRequest.findFirst({
            where: {
                userId,
                status: 'PENDING',
                expiresAt: { gt: new Date() }
            }
        })
        
        if (existingRequest) {
            return NextResponse.json(
                { 
                    error: 'Deletion request already pending',
                    message: 'You already have a deletion request pending. Please check your email for the confirmation link.',
                    expiresAt: existingRequest.expiresAt
                },
                { status: 409 }
            )
        }
        
        // Generate secure token
        const token = generateDeletionToken()
        const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000)
        
        // Create deletion request record
        const deletionRequest = await prisma.deletionRequest.create({
            data: {
                userId,
                token,
                mode,
                status: 'PENDING',
                expiresAt
            }
        })
        
        // Generate confirmation URL
        const confirmUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/gdpr/delete/confirm?token=${token}`
        
        // Send confirmation email
        await sendDeletionConfirmationEmail(user.email, user.name || 'User', confirmUrl, mode, validation)
        
        // Log the request
        logger.info('GDPR deletion request created', {
            requestId,
            userId,
            deletionRequestId: deletionRequest.id,
            mode
        })
        
        // Audit log
        logDeletionRequest(userId, mode === 'HARD' ? 'hard' : 'soft', true)
        
        return NextResponse.json({
            success: true,
            message: 'Deletion confirmation email sent. Please check your email to confirm.',
            expiresAt,
            warnings: [...validation.warnings, ...getDeletionWarnings(mode === 'HARD' ? 'hard' : 'soft')],
            contentSummary: validation.contentCount
        })
        
    } catch (error) {
        logger.error('GDPR deletion request failed', {
            requestId,
            error: error instanceof Error ? error.message : String(error)
        })
        
        return NextResponse.json(
            { error: 'Failed to process deletion request' },
            { status: 500 }
        )
    }
}

async function sendDeletionConfirmationEmail(
    email: string,
    name: string,
    confirmUrl: string,
    mode: 'SOFT' | 'HARD',
    validation: Awaited<ReturnType<typeof validateUserCanBeDeleted>>
): Promise<void> {
    const modeLabel = mode === 'HARD' ? 'Complete Data Removal' : 'Account Anonymization'
    
    const modeForWarnings: 'soft' | 'hard' = mode === 'HARD' ? 'hard' : 'soft'
    const warnings = getDeletionWarnings(modeForWarnings)
    
    const warningsHtml = warnings.map(w => `<li>${w}</li>`).join('')
    
    const contentSummaryHtml = validation.contentCount.wikiRevisions > 0 || validation.contentCount.pageVersions > 0
        ? `
        <h3>Your Content:</h3>
        <ul>
            ${validation.contentCount.wikiRevisions > 0 ? `<li>${validation.contentCount.wikiRevisions} wiki revisions</li>` : ''}
            ${validation.contentCount.pageVersions > 0 ? `<li>${validation.contentCount.pageVersions} page versions</li>` : ''}
            ${validation.contentCount.bookmarks > 0 ? `<li>${validation.contentCount.bookmarks} bookmarks</li>` : ''}
        </ul>
        `
        : ''
    
    const html = `
        <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #dc2626;">Confirm Account Deletion</h1>
            <p>Hi ${name},</p>
            <p>We received a request to delete your account and associated data (<strong>${modeLabel}</strong>).</p>
            
            <div style="background-color: #fef2f2; border: 1px solid #fecaca; padding: 16px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #dc2626; margin-top: 0;">Important Warnings:</h3>
                <ul style="color: #7f1d1d;">
                    ${warningsHtml}
                </ul>
            </div>
            
            ${contentSummaryHtml}
            
            <p>To confirm this deletion, click the button below. This link will expire in 24 hours.</p>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="${confirmUrl}" style="background-color: #dc2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">Confirm Deletion</a>
            </div>
            
            <p style="color: #666; font-size: 14px;">If you did not request this deletion, please ignore this email and ensure your account password is secure.</p>
            
            <p>Best,<br>The Cofactor Team</p>
        </div>
    `
    
    const text = `Hi ${name},

We received a request to delete your account and associated data (${modeLabel}).

IMPORTANT WARNINGS:
${warnings.map(w => `- ${w}`).join('\n')}

${validation.contentCount.wikiRevisions > 0 || validation.contentCount.pageVersions > 0 ? `
Your Content:
${validation.contentCount.wikiRevisions > 0 ? `- ${validation.contentCount.wikiRevisions} wiki revisions` : ''}
${validation.contentCount.pageVersions > 0 ? `- ${validation.contentCount.pageVersions} page versions` : ''}
${validation.contentCount.bookmarks > 0 ? `- ${validation.contentCount.bookmarks} bookmarks` : ''}
` : ''}

To confirm this deletion, visit: ${confirmUrl}

This link will expire in 24 hours.

If you did not request this deletion, please ignore this email and ensure your account password is secure.

Best,
The Cofactor Team`
    
    await sendNotificationEmail(email, name, 'Confirm Your Account Deletion', text)
}

// GET endpoint to check deletion request status
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            )
        }
        
        const userId = session.user.id
        
        // Get pending deletion request
        const deletionRequest = await prisma.deletionRequest.findFirst({
            where: {
                userId,
                status: 'PENDING',
                expiresAt: { gt: new Date() }
            },
            select: {
                id: true,
                mode: true,
                status: true,
                expiresAt: true,
                createdAt: true
            }
        })
        
        return NextResponse.json({
            hasPendingRequest: !!deletionRequest,
            request: deletionRequest
        })
        
    } catch (error) {
        logger.error('Failed to fetch deletion request status', { error: error instanceof Error ? error.message : String(error) })
        return NextResponse.json(
            { error: 'Failed to fetch status' },
            { status: 500 }
        )
    }
}
