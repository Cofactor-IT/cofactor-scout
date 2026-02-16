import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database/prisma'
import { logger } from '@/lib/logger'
import { anonymizeUser } from '@/lib/gdpr/anonymize'
import { jobQueue } from '@/lib/gdpr/queue'

// Register the deletion job handler
jobQueue.registerHandler('gdpr_delete', async (payload) => {
    const { userId, mode } = payload as { userId: string; mode: 'soft' | 'hard' }
    
    // Perform the anonymization/deletion
    const result = await anonymizeUser(userId, mode)
    
    return result
})

export async function POST(request: NextRequest) {
    const requestId = crypto.randomUUID()
    logger.info('GDPR deletion confirmation received', { requestId })
    
    try {
        // Parse request body
        const body = await request.json().catch(() => ({}))
        const { token } = body
        
        if (!token || typeof token !== 'string') {
            return NextResponse.json(
                { error: 'Token is required' },
                { status: 400 }
            )
        }
        
        // Find the deletion request
        const deletionRequest = await prisma.deletionRequest.findFirst({
            where: {
                token,
                status: 'PENDING',
                expiresAt: { gt: new Date() }
            },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        name: true
                    }
                }
            }
        })
        
        if (!deletionRequest) {
            // Check if token exists but is expired
            const expiredRequest = await prisma.deletionRequest.findFirst({
                where: {
                    token,
                    status: 'PENDING',
                    expiresAt: { lte: new Date() }
                }
            })
            
            if (expiredRequest) {
                // Update status to expired
                await prisma.deletionRequest.update({
                    where: { id: expiredRequest.id },
                    data: { status: 'EXPIRED' }
                })
                
                return NextResponse.json(
                    { 
                        error: 'Token expired',
                        message: 'This deletion confirmation link has expired. Please request a new deletion.'
                    },
                    { status: 410 }
                )
            }
            
            return NextResponse.json(
                { 
                    error: 'Invalid token',
                    message: 'This deletion confirmation link is invalid or has already been used.'
                },
                { status: 400 }
            )
        }
        
        const userId = deletionRequest.userId
        const mode = deletionRequest.mode === 'HARD' ? 'hard' : 'soft'
        
        // Update request status
        await prisma.deletionRequest.update({
            where: { id: deletionRequest.id },
            data: {
                status: 'CONFIRMED',
                confirmedAt: new Date()
            }
        })
        
        // Add to background job queue for actual deletion
        await jobQueue.add('gdpr_delete', {
            userId,
            mode
        })
        
        // Perform the deletion/anonymization immediately (for better UX)
        // Or you could do this in the background and email the user
        let result
        try {
            result = await anonymizeUser(userId, mode)
            
            logger.info('GDPR deletion completed', {
                requestId,
                userId,
                mode,
                result
            })
        } catch (deleteError) {
            // Update request status to failed
            await prisma.deletionRequest.update({
                where: { id: deletionRequest.id },
                data: { status: 'FAILED' }
            })
            
            logger.error('GDPR deletion failed', {
                requestId,
                userId,
                error: deleteError instanceof Error ? deleteError.message : String(deleteError)
            })
            
            return NextResponse.json(
                { 
                    error: 'Deletion failed',
                    message: 'An error occurred during deletion. Our team has been notified.'
                },
                { status: 500 }
            )
        }
        
        return NextResponse.json({
            success: true,
            message: mode === 'hard' 
                ? 'Your account and all data have been permanently deleted.'
                : 'Your account has been anonymized. Personal data has been removed.',
            mode,
            preservedContent: result.preservedContent,
            deletedRecords: result.deletedRecords
        })
        
    } catch (error) {
        logger.error('GDPR deletion confirmation failed', {
            requestId,
            error: error instanceof Error ? error.message : String(error)
        })
        
        return NextResponse.json(
            { error: 'Failed to process deletion confirmation' },
            { status: 500 }
        )
    }
}

// GET endpoint to validate token (for confirmation page)
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const token = searchParams.get('token')
        
        if (!token) {
            return NextResponse.json(
                { error: 'Token is required' },
                { status: 400 }
            )
        }
        
        // Find the deletion request
        const deletionRequest = await prisma.deletionRequest.findFirst({
            where: {
                token,
                status: 'PENDING',
                expiresAt: { gt: new Date() }
            },
            select: {
                id: true,
                mode: true,
                expiresAt: true,
                createdAt: true,
                user: {
                    select: {
                        email: true
                    }
                }
            }
        })
        
        if (!deletionRequest) {
            // Check if expired
            const expiredRequest = await prisma.deletionRequest.findFirst({
                where: {
                    token,
                    status: 'PENDING',
                    expiresAt: { lte: new Date() }
                }
            })
            
            if (expiredRequest) {
                return NextResponse.json(
                    { 
                        valid: false,
                        error: 'Token expired',
                        message: 'This deletion confirmation link has expired.'
                    },
                    { status: 410 }
                )
            }
            
            return NextResponse.json(
                { 
                    valid: false,
                    error: 'Invalid token',
                    message: 'This deletion confirmation link is invalid or has already been used.'
                },
                { status: 400 }
            )
        }
        
        return NextResponse.json({
            valid: true,
            mode: deletionRequest.mode,
            email: deletionRequest.user.email.replace(/(.{2})(.*)(@.*)/, '$1***$3'),
            expiresAt: deletionRequest.expiresAt
        })
        
    } catch (error) {
        logger.error('Failed to validate deletion token', { error: error instanceof Error ? error.message : String(error) })
        return NextResponse.json(
            { error: 'Failed to validate token' },
            { status: 500 }
        )
    }
}
