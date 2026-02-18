import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/queues/status/[jobId]
 * 
 * Check the status of a job by its ID
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ jobId: string }> }
) {
    // Queue/job tracking relied on BullMQ + Redis, which is currently not supported
    // in the schema-aligned codebase. Keep the endpoint for compatibility.
    const { jobId } = await params
    return NextResponse.json(
        { error: 'Queue job status is no longer supported.', jobId },
        { status: 410 }
    )
}
