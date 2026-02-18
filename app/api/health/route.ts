import { NextResponse } from 'next/server'
import { prisma } from '@/lib/database/prisma'

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

    // Queue system has been removed/disabled in the schema-aligned codebase.
    checks.queues = { status: 'disabled' }

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
