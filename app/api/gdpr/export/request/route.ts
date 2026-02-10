import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'
import { logger } from '@/lib/logger'
import { jobQueue } from '@/lib/gdpr/queue'
import { generateUserExport } from '@/lib/gdpr/export'
import { sendNotificationEmail } from '@/lib/email'
import { logExportRequest } from '@/lib/gdpr/audit'

// Register the export job handler
jobQueue.registerHandler('gdpr_export', async (payload) => {
    const { userId, email, name } = payload as { userId: string; email: string; name: string }
    
    // Generate the export
    const result = await generateUserExport(userId, 'both')
    
    // Update export job record
    await prisma.exportJob.update({
        where: { id: result.exportId },
        data: {
            status: 'COMPLETED',
            fileUrl: result.jsonPath || result.csvPath,
            completedAt: new Date()
        }
    })
    
    // Send email notification
    const downloadUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/gdpr/export/download/${result.exportId}`
    
    await sendNotificationEmail(
        email,
        name || 'User',
        'Your Data Export is Ready',
        `Your GDPR data export has been generated and is ready for download. The download link will be available for 7 days.`,
        `/api/gdpr/export/download/${result.exportId}`
    )
    
    return result
})

export async function POST(request: NextRequest) {
    const requestId = crypto.randomUUID()
    logger.info('GDPR export request received', { requestId })
    
    try {
        // Authentication check
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            logger.warn('Unauthorized GDPR export request', { requestId })
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            )
        }
        
        const userId = session.user.id
        const clientIp = getClientIp(request)
        
        // Rate limiting - strict limit for GDPR requests
        const rateLimitKey = `gdpr_export:${userId}:${clientIp}`
        const rateLimitResult = checkRateLimit(rateLimitKey, {
            limit: 3, // 3 exports per window
            window: 24 * 60 * 60 * 1000 // 24 hours
        })
        
        if (!rateLimitResult.success) {
            logger.warn('GDPR export rate limit exceeded', { 
                requestId, 
                userId,
                resetTime: rateLimitResult.resetTime 
            })
            
            return NextResponse.json(
                { 
                    error: 'Rate limit exceeded',
                    message: 'You can request a data export once per day. Please try again later.',
                    resetTime: rateLimitResult.resetTime
                },
                { status: 429 }
            )
        }
        
        // Parse request body
        const body = await request.json().catch(() => ({}))
        const format = body.format || 'both'
        
        if (!['json', 'csv', 'both'].includes(format)) {
            return NextResponse.json(
                { error: 'Invalid format. Must be json, csv, or both' },
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
        
        // Check for existing pending export
        const existingExport = await prisma.exportJob.findFirst({
            where: {
                userId,
                status: { in: ['PENDING', 'PROCESSING'] }
            }
        })
        
        if (existingExport) {
            return NextResponse.json(
                { 
                    error: 'Export already in progress',
                    message: 'You already have a data export being processed.',
                    exportId: existingExport.id
                },
                { status: 409 }
            )
        }
        
        // Create export job record
        const exportJob = await prisma.exportJob.create({
            data: {
                userId,
                type: 'USER_DATA',
                status: 'PENDING'
            }
        })
        
        // Add to background job queue
        await jobQueue.add('gdpr_export', {
            userId,
            email: user.email,
            name: user.name,
            format,
            exportJobId: exportJob.id
        })
        
        // Log the request
        logger.info('GDPR export request queued', {
            requestId,
            userId,
            exportJobId: exportJob.id
        })
        
        // Audit log
        logExportRequest(userId, format, true)
        
        return NextResponse.json({
            success: true,
            message: 'Data export request received. You will receive an email when it is ready.',
            exportId: exportJob.id,
            estimatedTime: '5-10 minutes',
            expiresIn: '7 days'
        })
        
    } catch (error) {
        logger.error('GDPR export request failed', {
            requestId,
            error: error instanceof Error ? error.message : String(error)
        })
        
        return NextResponse.json(
            { error: 'Failed to process export request' },
            { status: 500 }
        )
    }
}

// GET endpoint to check export status
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
        
        // Get user's export history
        const exports = await prisma.exportJob.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 10,
            select: {
                id: true,
                status: true,
                createdAt: true,
                completedAt: true,
                fileUrl: true
            }
        })
        
        return NextResponse.json({
            exports: exports.map(exp => ({
                id: exp.id,
                status: exp.status,
                createdAt: exp.createdAt,
                completedAt: exp.completedAt,
                downloadAvailable: exp.status === 'COMPLETED' && exp.fileUrl !== null,
                downloadUrl: exp.status === 'COMPLETED' ? `/api/gdpr/export/download/${exp.id}` : null
            }))
        })
        
    } catch (error) {
        logger.error('Failed to fetch export history', { error: error instanceof Error ? error.message : String(error) })
        return NextResponse.json(
            { error: 'Failed to fetch export history' },
            { status: 500 }
        )
    }
}
