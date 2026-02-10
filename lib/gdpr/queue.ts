/**
 * Simple Background Job Queue for GDPR Operations
 * In production, consider using Bull, BullMQ, or a dedicated queue service
 */

import { logger } from '@/lib/logger'

type JobType = 'gdpr_export' | 'gdpr_delete'
type JobStatus = 'pending' | 'processing' | 'completed' | 'failed'

interface Job {
    id: string
    type: JobType
    payload: Record<string, unknown>
    status: JobStatus
    createdAt: Date
    startedAt?: Date
    completedAt?: Date
    result?: unknown
    error?: string
    attempts: number
    maxAttempts: number
}

type JobHandler = (payload: Record<string, unknown>) => Promise<unknown>

class JobQueue {
    private jobs: Map<string, Job> = new Map()
    private handlers: Map<JobType, JobHandler> = new Map()
    private processing: boolean = false
    private intervalId: NodeJS.Timeout | null = null

    constructor(private readonly concurrency: number = 2) {}

    registerHandler(type: JobType, handler: JobHandler): void {
        this.handlers.set(type, handler)
    }

    async add(type: JobType, payload: Record<string, unknown>, maxAttempts: number = 3): Promise<string> {
        const id = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        
        const job: Job = {
            id,
            type,
            payload,
            status: 'pending',
            createdAt: new Date(),
            attempts: 0,
            maxAttempts
        }
        
        this.jobs.set(id, job)
        
        logger.info('Job added to queue', { jobId: id, type })
        
        // Start processing if not already running
        this.startProcessing()
        
        return id
    }

    getJob(id: string): Job | undefined {
        return this.jobs.get(id)
    }

    getJobsByType(type: JobType): Job[] {
        return Array.from(this.jobs.values()).filter(job => job.type === type)
    }

    getPendingJobs(): Job[] {
        return Array.from(this.jobs.values()).filter(job => job.status === 'pending')
    }

    private startProcessing(): void {
        if (this.processing || this.intervalId) {
            return
        }
        
        this.processing = true
        
        // Process jobs every 5 seconds
        this.intervalId = setInterval(() => {
            this.processJobs()
        }, 5000)
        
        // Process immediately
        this.processJobs()
    }

    private async processJobs(): Promise<void> {
        const pendingJobs = this.getPendingJobs()
        
        if (pendingJobs.length === 0) {
            // No pending jobs, stop processing after a delay
            setTimeout(() => {
                if (this.getPendingJobs().length === 0) {
                    this.stopProcessing()
                }
            }, 30000)
            return
        }
        
        // Process up to concurrency limit
        const jobsToProcess = pendingJobs.slice(0, this.concurrency)
        
        await Promise.all(jobsToProcess.map(job => this.executeJob(job)))
    }

    private async executeJob(job: Job): Promise<void> {
        const handler = this.handlers.get(job.type)
        
        if (!handler) {
            job.status = 'failed'
            job.error = `No handler registered for job type: ${job.type}`
            logger.error('Job failed - no handler', { jobId: job.id, type: job.type })
            return
        }
        
        job.status = 'processing'
        job.startedAt = new Date()
        job.attempts++
        
        logger.info('Job started', { jobId: job.id, type: job.type, attempt: job.attempts })
        
        try {
            const result = await handler(job.payload)
            
            job.status = 'completed'
            job.completedAt = new Date()
            job.result = result
            
            logger.info('Job completed', { jobId: job.id, type: job.type, duration: job.completedAt.getTime() - job.startedAt.getTime() })
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error)
            
            if (job.attempts < job.maxAttempts) {
                // Retry
                job.status = 'pending'
                logger.warn('Job failed, will retry', { jobId: job.id, type: job.type, attempt: job.attempts, error: errorMessage })
            } else {
                // Max attempts reached
                job.status = 'failed'
                job.error = errorMessage
                job.completedAt = new Date()
                
                logger.error('Job failed permanently', { jobId: job.id, type: job.type, attempts: job.attempts, error: errorMessage })
            }
        }
    }

    private stopProcessing(): void {
        if (this.intervalId) {
            clearInterval(this.intervalId)
            this.intervalId = null
        }
        this.processing = false
    }

    cleanup(maxAgeHours: number = 24): void {
        const cutoff = new Date(Date.now() - maxAgeHours * 60 * 60 * 1000)
        
        for (const [id, job] of this.jobs.entries()) {
            if (job.completedAt && job.completedAt < cutoff) {
                this.jobs.delete(id)
            }
        }
        
        logger.info('Job queue cleanup completed', { removed: this.jobs.size })
    }

    getStats(): { total: number; pending: number; processing: number; completed: number; failed: number } {
        const jobs = Array.from(this.jobs.values())
        
        return {
            total: jobs.length,
            pending: jobs.filter(j => j.status === 'pending').length,
            processing: jobs.filter(j => j.status === 'processing').length,
            completed: jobs.filter(j => j.status === 'completed').length,
            failed: jobs.filter(j => j.status === 'failed').length
        }
    }
}

// Export singleton instance
export const jobQueue = new JobQueue()

// Export types
export type { Job, JobType, JobStatus }
