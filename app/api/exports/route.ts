import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'
import { addExportJob, ExportType } from '@/lib/queues'
import type { ExportType as PrismaExportType, JobStatus } from '@prisma/client'
import { info, error } from '@/lib/logger'

interface ExportFilters {
    [key: string]: string | number | boolean | string[] | undefined
}

/**
 * POST /api/exports
 * 
 * Create a new export job
 */
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const body = await request.json()
        const { type, filters } = body as { type: string; filters?: ExportFilters }

        // Validate export type
        if (!type || !Object.values(ExportType).includes(type as ExportType)) {
            return NextResponse.json(
                { error: 'Invalid export type' },
                { status: 400 }
            )
        }

        // Create the export job record in the database
        const exportJob = await prisma.exportJob.create({
            data: {
                userId: session.user.id,
                type: type as PrismaExportType,
                status: 'PENDING' as JobStatus,
            }
        })

        // Add the job to the queue
        const job = await addExportJob(
            exportJob.id,
            session.user.id,
            type as ExportType,
            filters
        )

        if (!job) {
            info('Export job created but queue unavailable', { 
                exportJobId: exportJob.id, 
                userId: session.user.id,
                type 
            })
        } else {
            info('Export job created and queued', { 
                exportJobId: exportJob.id, 
                jobId: job.id,
                userId: session.user.id,
                type 
            })
        }

        return NextResponse.json({
            success: true,
            exportJob: {
                id: exportJob.id,
                status: exportJob.status,
                type: exportJob.type,
                createdAt: exportJob.createdAt.toISOString(),
                jobId: job?.id,
            }
        })
    } catch (err) {
        error('Error creating export job', { error: err instanceof Error ? err.message : String(err) })
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

/**
 * GET /api/exports
 * 
 * Get list of export jobs for the current user
 */
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const { searchParams } = new URL(request.url)
        const status = searchParams.get('status')

        const where: { userId: string; status?: JobStatus } = { userId: session.user.id }
        if (status) {
            where.status = status as JobStatus
        }

        const exportJobs = await prisma.exportJob.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: 50,
        })

        return NextResponse.json({
            success: true,
            exports: exportJobs.map(job => ({
                id: job.id,
                type: job.type,
                status: job.status,
                fileUrl: job.fileUrl,
                createdAt: job.createdAt.toISOString(),
                completedAt: job.completedAt?.toISOString(),
            }))
        })
    } catch (err) {
        error('Error fetching export jobs', { error: err instanceof Error ? err.message : String(err) })
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
