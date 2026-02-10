import { Queue, Job } from 'bullmq'
import { getQueueConnection, isQueueConnectionHealthy } from './connection'
import { info, error } from '@/lib/logger'

export enum EmailJobType {
    WELCOME = 'welcome',
    VERIFICATION = 'verification',
    PASSWORD_RESET = 'password_reset',
    NOTIFICATION = 'notification',
}

export interface EmailJobData {
    type: EmailJobType
    toEmail: string
    name: string
    metadata?: Record<string, any>
}

let emailQueue: Queue<EmailJobData> | null = null

export function getEmailQueue(): Queue<EmailJobData> | null {
    if (!emailQueue && process.env.REDIS_URL) {
        const redis = getQueueConnection()
        if (!redis) return null

        emailQueue = new Queue<EmailJobData>('email', {
            connection: redis,
            defaultJobOptions: {
                attempts: 3,
                backoff: {
                    type: 'exponential',
                    delay: 1000,
                },
                removeOnComplete: {
                    count: 100,
                    age: 24 * 3600,
                },
                removeOnFail: {
                    count: 50,
                    age: 7 * 24 * 3600,
                },
            },
        })

        info('Email queue initialized')
    }

    return emailQueue
}

export async function addEmailJob(
    type: EmailJobType,
    toEmail: string,
    name: string,
    metadata?: Record<string, any>
): Promise<Job<EmailJobData> | null> {
    const queue = getEmailQueue()
    
    if (!queue) {
        error('Email queue not available - falling back to synchronous', { type, toEmail })
        return null
    }

    try {
        const isHealthy = await isQueueConnectionHealthy()
        if (!isHealthy) {
            error('Redis not healthy - cannot add email job to queue', { type, toEmail })
            return null
        }

        const job = await queue.add(
            type,
            { type, toEmail, name, metadata },
            {
                priority: type === EmailJobType.PASSWORD_RESET ? 1 : 2,
            }
        )

        info('Email job added to queue', { jobId: job.id, type, toEmail })
        return job
    } catch (err) {
        error('Failed to add email job to queue', { type, toEmail, error: err instanceof Error ? err.message : String(err) })
        return null
    }
}

export async function closeEmailQueue(): Promise<void> {
    if (emailQueue) {
        await emailQueue.close()
        emailQueue = null
        info('Email queue closed')
    }
}
