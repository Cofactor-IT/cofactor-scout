import { NextResponse } from 'next/server'
import { getAllQueueStatus } from '@/lib/queues/status'
import { prisma } from '@/lib/prisma'

export async function GET() {
    const checks: Record<string, { status: string; error?: string }> = {}
    let overallStatus = 'healthy'

    // Check database
    try {
        await prisma.$queryRaw`SELECT 1`
        checks.database = { status: 'ok' }
    } catch (error) {
        checks.database = { 
            status: 'error', 
            error: error instanceof Error ? error.message : 'Database connection failed' 
        }
        overallStatus = 'unhealthy'
    }

    // Check queue system
    try {
        const queueHealth = await getAllQueueStatus()
        checks.queues = { 
            status: queueHealth.overallStatus,
            ...(queueHealth.overallStatus !== 'healthy' && {
                error: `Redis connected: ${queueHealth.redisConnected}, Queues: ${queueHealth.queues.length}`
            })
        }
        
        if (queueHealth.overallStatus === 'unhealthy') {
            overallStatus = 'unhealthy'
        } else if (queueHealth.overallStatus === 'degraded' && overallStatus === 'healthy') {
            overallStatus = 'degraded'
        }
    } catch (error) {
        checks.queues = { 
            status: 'error', 
            error: error instanceof Error ? error.message : 'Queue health check failed' 
        }
        overallStatus = 'unhealthy'
    }

    const statusCode = overallStatus === 'healthy' ? 200 : overallStatus === 'degraded' ? 200 : 503

    return NextResponse.json(
        { 
            status: overallStatus, 
            timestamp: new Date().toISOString(),
            checks 
        },
        { status: statusCode }
    )
}
