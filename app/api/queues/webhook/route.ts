import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database/prisma'
import { error, info } from '@/lib/logger'

interface WebhookBody {
    event: 'completed' | 'failed'
    jobId: string
    queue: 'email' | 'export'
    data: unknown
    result?: unknown
    error?: string
}

/**
 * POST /api/queues/webhook
 * 
 * Webhook endpoint for job completion notifications
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json() as WebhookBody
        const { event, jobId, queue: queueName, data, result, error: jobError } = body

        // Validate required fields
        if (!event || !jobId || !queueName) {
            return NextResponse.json(
                { error: 'Missing required fields: event, jobId, queue' },
                { status: 400 }
            )
        }

        // Validate event type
        if (!['completed', 'failed'].includes(event)) {
            return NextResponse.json(
                { error: 'Invalid event type. Must be "completed" or "failed"' },
                { status: 400 }
            )
        }

        // Validate queue name
        if (!['email', 'export'].includes(queueName)) {
            return NextResponse.json(
                { error: 'Invalid queue name. Must be "email" or "export"' },
                { status: 400 }
            )
        }

        info('Queue webhook received', { event, jobId, queue: queueName })

        // Handle export job completion
        if (queueName === 'export') {
            await handleExportWebhook(event, jobId, data, result, jobError)
        }

        // Handle email job completion
        if (queueName === 'email') {
            await handleEmailWebhook(event, jobId, data, result, jobError)
        }

        return NextResponse.json({ success: true })
    } catch (err) {
        error('Error processing queue webhook', { error: err instanceof Error ? err.message : String(err) })
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

async function handleExportWebhook(
    event: string,
    jobId: string,
    data: unknown,
    result?: unknown,
    jobError?: string
) {
    const exportData = data as { exportJobId?: string }
    const exportJobId = exportData?.exportJobId

    if (!exportJobId) {
        error('Export webhook missing exportJobId', { jobId })
        return
    }

    if (event === 'completed') {
        await prisma.exportJob.update({
            where: { id: exportJobId },
            data: {
                status: 'COMPLETED',
                fileUrl: typeof result === 'string' ? result : undefined,
                completedAt: new Date()
            }
        })
        info('Export job marked as completed via webhook', { exportJobId, jobId, fileUrl: result })
    } else if (event === 'failed') {
        await prisma.exportJob.update({
            where: { id: exportJobId },
            data: {
                status: 'FAILED',
                completedAt: new Date()
            }
        })
        error('Export job marked as failed via webhook', { exportJobId, jobId, error: jobError })
    }
}

async function handleEmailWebhook(
    event: string,
    jobId: string,
    data: unknown,
    _result?: unknown,
    jobError?: string
) {
    const emailData = data as { type?: string; toEmail?: string }
    
    if (event === 'completed') {
        info('Email job completed via webhook', {
            jobId,
            type: emailData?.type,
            toEmail: emailData?.toEmail
        })
    } else if (event === 'failed') {
        error('Email job failed via webhook', {
            jobId,
            type: emailData?.type,
            toEmail: emailData?.toEmail,
            error: jobError
        })
    }
}
