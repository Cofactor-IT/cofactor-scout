import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/database/prisma'
import { checkRateLimit, getClientIp } from '@/lib/security/rate-limit'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
    const requestId = crypto.randomUUID()
    logger.info('Report submission received', { requestId })
    
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            )
        }
        
        const userId = session.user.id
        const clientIp = getClientIp(request)
        
        // Rate limiting
        const rateLimitKey = `report:${userId}:${clientIp}`
        const rateLimitResult = checkRateLimit(rateLimitKey, {
            limit: 5,
            window: 60 * 60 * 1000
        })
        
        if (!rateLimitResult.success) {
            return NextResponse.json(
                { 
                    error: 'Rate limit exceeded',
                    message: 'Too many reports submitted. Please try again later.',
                    resetTime: rateLimitResult.resetTime
                },
                { status: 429 }
            )
        }
        
        const body = await request.json()
        const { contentType, contentId, reason, description } = body
        
        if (!contentType || !contentId || !reason) {
            return NextResponse.json(
                { error: 'Missing required fields: contentType, contentId, reason' },
                { status: 400 }
            )
        }
        
        const validTypes = ['WIKI_REVISION', 'COMMENT', 'USER', 'PERSON']
        if (!validTypes.includes(contentType)) {
            return NextResponse.json(
                { error: 'Invalid content type' },
                { status: 400 }
            )
        }
        
        if (reason.length < 10 || reason.length > 500) {
            return NextResponse.json(
                { error: 'Reason must be between 10 and 500 characters' },
                { status: 400 }
            )
        }
        
        // Check for duplicate report
        const existingReport = await prisma.report.findFirst({
            where: {
                reporterId: userId,
                contentType,
                contentId,
                status: { in: ['PENDING', 'UNDER_REVIEW', 'RESOLVED'] }
            }
        })
        
        if (existingReport) {
            return NextResponse.json(
                { error: 'You have already reported this content' },
                { status: 409 }
            )
        }
        
        // Validate content exists
        let contentExists = false
        if (contentType === 'WIKI_REVISION') {
            const revision = await prisma.wikiRevision.findUnique({
                where: { id: contentId }
            })
            contentExists = !!revision
        }
        
        if (!contentExists) {
            return NextResponse.json(
                { error: 'Content not found' },
                { status: 404 }
            )
        }
        
        // Create report
        const report = await prisma.report.create({
            data: {
                reporterId: userId,
                contentType,
                contentId,
                reason,
                description: description || null,
                status: 'PENDING'
            }
        })
        
        logger.info('Report created', {
            requestId,
            reportId: report.id,
            reporterId: userId,
            contentType,
            contentId
        })
        
        return NextResponse.json({
            success: true,
            message: 'Report submitted successfully. Our team will review it shortly.',
            reportId: report.id
        })
        
    } catch (error) {
        logger.error('Report submission failed', {
            requestId,
            error: error instanceof Error ? error.message : String(error)
        })
        
        return NextResponse.json(
            { error: 'Failed to submit report' },
            { status: 500 }
        )
    }
}
