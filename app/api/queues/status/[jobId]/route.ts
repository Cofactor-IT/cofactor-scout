import { NextRequest, NextResponse } from 'next/server'
import { Job } from 'bullmq'
import { getEmailQueue } from '@/lib/queues/email.queue'
import { getExportQueue } from '@/lib/queues/export.queue'
import { error, info } from '@/lib/logger'

interface JobStatus {
    id: string
    state: string
    type: string
    createdAt: number
    processedOn?: number
    finishedOn?: number
    attemptsMade: number
    failedReason?: string
    returnvalue?: unknown
    progress: number
    data: unknown
}

async function getJobStatus(jobId: string): Promise<JobStatus | null> {
    const emailQueue = getEmailQueue()
    const exportQueue = getExportQueue()

    let job: Job | undefined

    // Try to find job in email queue
    if (emailQueue) {
        job = await emailQueue.getJob(jobId)
    }

    // Try export queue if not found
    if (!job && exportQueue) {
        job = await exportQueue.getJob(jobId)
    }

    if (!job) {
        return null
    }

    const state = await job.getState()

    return {
        id: job.id || jobId,
        state,
        type: job.name,
        createdAt: job.timestamp,
        processedOn: job.processedOn,
        finishedOn: job.finishedOn,
        attemptsMade: job.attemptsMade,
        failedReason: job.failedReason,
        returnvalue: job.returnvalue,
        progress: job.progress as number,
        data: job.data,
    }
}

/**
 * GET /api/queues/status/[jobId]
 * 
 * Check the status of a job by its ID
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ jobId: string }> }
) {
    try {
        const { jobId } = await params

        if (!jobId) {
            return NextResponse.json(
                { error: 'Job ID is required' },
                { status: 400 }
            )
        }

        const status = await getJobStatus(jobId)

        if (!status) {
            return NextResponse.json(
                { error: 'Job not found' },
                { status: 404 }
            )
        }

        info('Job status checked', { jobId, state: status.state })

        return NextResponse.json(status)
    } catch (err) {
        error('Error checking job status', { jobId: 'unknown', error: err instanceof Error ? err.message : String(err) })
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
