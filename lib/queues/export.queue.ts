import { Queue, Job } from 'bullmq'
import { getQueueConnection, isQueueConnectionHealthy } from './connection'
import { info, error } from '@/lib/logger'

export enum ExportType {
    USER_DATA = 'USER_DATA',
    WIKI_PAGES = 'WIKI_PAGES',
    MEMBERS = 'MEMBERS',
    ANALYTICS = 'ANALYTICS',
}

export interface ExportJobData {
    exportJobId: string
    userId: string
    type: ExportType
    filters?: Record<string, any>
}

let exportQueue: Queue<ExportJobData> | null = null

export function getExportQueue(): Queue<ExportJobData> | null {
    if (!exportQueue && process.env.REDIS_URL) {
        const redis = getQueueConnection()
        if (!redis) return null

        exportQueue = new Queue<ExportJobData>('export', {
            connection: redis,
            defaultJobOptions: {
                attempts: 3,
                backoff: {
                    type: 'exponential',
                    delay: 2000,
                },
                removeOnComplete: {
                    count: 50,
                    age: 7 * 24 * 3600,
                },
                removeOnFail: {
                    count: 25,
                    age: 30 * 24 * 3600,
                },
            },
        })

        info('Export queue initialized')
    }

    return exportQueue
}

export async function addExportJob(
    exportJobId: string,
    userId: string,
    type: ExportType,
    filters?: Record<string, any>
): Promise<Job<ExportJobData> | null> {
    const queue = getExportQueue()
    
    if (!queue) {
        error('Export queue not available', { exportJobId, type, userId })
        return null
    }

    try {
        const isHealthy = await isQueueConnectionHealthy()
        if (!isHealthy) {
            error('Redis not healthy - cannot add export job to queue', { exportJobId, type, userId })
            return null
        }

        const job = await queue.add(
            type,
            { exportJobId, userId, type, filters },
            {
                jobId: exportJobId,
            }
        )

        info('Export job added to queue', { jobId: job.id, exportJobId, type, userId })
        return job
    } catch (err) {
        error('Failed to add export job to queue', { 
            exportJobId, 
            type, 
            userId, 
            error: err instanceof Error ? err.message : String(err) 
        })
        return null
    }
}

export async function closeExportQueue(): Promise<void> {
    if (exportQueue) {
        await exportQueue.close()
        exportQueue = null
        info('Export queue closed')
    }
}
