import { Queue, Job } from 'bullmq'
import { getQueueConnection, isQueueConnectionHealthy } from './connection'
import { info, error } from '@/lib/logger'

export interface Article14JobData {
  researcherId: string
  email: string
  researcherName: string
  source: string
  enqueuedAt: string
}

let article14Queue: Queue<Article14JobData> | null = null

export function getArticle14Queue(): Queue<Article14JobData> | null {
  if (!article14Queue && process.env.REDIS_URL) {
    const redis = getQueueConnection()
    if (!redis) return null

    article14Queue = new Queue<Article14JobData>('article14-notification', {
      connection: redis,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 300000,
        },
        removeOnComplete: {
          count: 1000,
          age: 7776000,
        },
        removeOnFail: {
          count: 500,
          age: 15552000,
        },
      },
    })

    info('Article 14 notification queue initialized')
  }

  return article14Queue
}

export async function addArticle14Job(
  researcherId: string,
  email: string,
  researcherName: string,
  source: string,
  jobIdSuffix?: string
): Promise<Job<Article14JobData> | null> {
  const queue = getArticle14Queue()
  
  if (!queue) {
    error('Article 14 queue not available', { researcherId, email })
    return null
  }

  try {
    const isHealthy = await isQueueConnectionHealthy()
    if (!isHealthy) {
      error('Redis not healthy - cannot add Article 14 job to queue', { researcherId, email })
      return null
    }

    const enqueuedAt = new Date().toISOString()
    const jobId = jobIdSuffix
      ? `article14-${researcherId}-${jobIdSuffix}`
      : `article14-${researcherId}`

    const job = await queue.add(
      jobId,
      {
        researcherId,
        email,
        researcherName,
        source,
        enqueuedAt,
      },
      {
        jobId,
      }
    )

    info('Article 14 notification job added to queue', { 
      jobId: job.id, 
      researcherId, 
      email 
    })
    return job
  } catch (err) {
    error('Failed to add Article 14 job to queue', { 
      researcherId, 
      email, 
      error: err instanceof Error ? err.message : String(err) 
    })
    return null
  }
}

export async function closeArticle14Queue(): Promise<void> {
  if (article14Queue) {
    await article14Queue.close()
    article14Queue = null
    info('Article 14 notification queue closed')
  }
}
