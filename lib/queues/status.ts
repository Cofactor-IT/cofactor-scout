/**
 * Queue Status Utility
 * 
 * Helper functions for checking queue health and getting queue statistics
 */

import { getEmailQueue } from './email.queue'
import { getExportQueue } from './export.queue'
import { isQueueConnectionHealthy } from './connection'
import { info, error } from '@/lib/logger'

export interface QueueStatus {
    name: string
    isHealthy: boolean
    waitingCount: number
    activeCount: number
    completedCount: number
    failedCount: number
    delayedCount: number
}

export interface QueueHealthReport {
    overallStatus: 'healthy' | 'degraded' | 'unhealthy'
    redisConnected: boolean
    queues: QueueStatus[]
    timestamp: string
}

/**
 * Get status of all queues
 */
export async function getAllQueueStatus(): Promise<QueueHealthReport> {
    const redisConnected = await isQueueConnectionHealthy()
    const queues: QueueStatus[] = []

    const emailQueue = getEmailQueue()
    if (emailQueue) {
        try {
            const [waiting, active, completed, failed, delayed] = await Promise.all([
                emailQueue.getWaitingCount(),
                emailQueue.getActiveCount(),
                emailQueue.getCompletedCount(),
                emailQueue.getFailedCount(),
                emailQueue.getDelayedCount(),
            ])

            queues.push({
                name: 'email',
                isHealthy: redisConnected,
                waitingCount: waiting,
                activeCount: active,
                completedCount: completed,
                failedCount: failed,
                delayedCount: delayed,
            })
        } catch (err) {
            error('Error getting email queue status', { error: err instanceof Error ? err.message : String(err) })
        }
    }

    const exportQueue = getExportQueue()
    if (exportQueue) {
        try {
            const [waiting, active, completed, failed, delayed] = await Promise.all([
                exportQueue.getWaitingCount(),
                exportQueue.getActiveCount(),
                exportQueue.getCompletedCount(),
                exportQueue.getFailedCount(),
                exportQueue.getDelayedCount(),
            ])

            queues.push({
                name: 'export',
                isHealthy: redisConnected,
                waitingCount: waiting,
                activeCount: active,
                completedCount: completed,
                failedCount: failed,
                delayedCount: delayed,
            })
        } catch (err) {
            error('Error getting export queue status', { error: err instanceof Error ? err.message : String(err) })
        }
    }

    // Determine overall status
    let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy'
    if (!redisConnected) {
        overallStatus = 'unhealthy'
    } else if (queues.some(q => q.failedCount > 10)) {
        overallStatus = 'degraded'
    }

    return {
        overallStatus,
        redisConnected,
        queues,
        timestamp: new Date().toISOString(),
    }
}

/**
 * Clean up old completed/failed jobs from queues
 * This can be called periodically via a cron job
 */
export async function cleanupOldJobs(): Promise<void> {
    const emailQueue = getEmailQueue()
    const exportQueue = getExportQueue()

    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000

    if (emailQueue) {
        try {
            // Clean completed jobs older than 1 day
            await emailQueue.clean(oneDayAgo, 1000, 'completed')
            // Clean failed jobs older than 1 week
            await emailQueue.clean(oneWeekAgo, 1000, 'failed')
            info('Email queue cleaned up')
        } catch (err) {
            error('Error cleaning email queue', { error: err instanceof Error ? err.message : String(err) })
        }
    }

    if (exportQueue) {
        try {
            await exportQueue.clean(oneDayAgo, 1000, 'completed')
            await exportQueue.clean(oneWeekAgo, 1000, 'failed')
            info('Export queue cleaned up')
        } catch (err) {
            error('Error cleaning export queue', { error: err instanceof Error ? err.message : String(err) })
        }
    }
}

/**
 * Retry failed jobs
 * Can be called to manually retry failed jobs
 */
export async function retryFailedJobs(queueName: 'email' | 'export'): Promise<number> {
    const queue = queueName === 'email' ? getEmailQueue() : getExportQueue()

    if (!queue) {
        throw new Error(`Queue ${queueName} not available`)
    }

    const failedJobs = await queue.getFailed()
    let retriedCount = 0

    for (const job of failedJobs) {
        try {
            await job.retry()
            retriedCount++
        } catch (err) {
            error(`Failed to retry job ${job.id}`, { error: err instanceof Error ? err.message : String(err) })
        }
    }

    info(`Retried ${retriedCount} failed jobs in ${queueName} queue`)
    return retriedCount
}
