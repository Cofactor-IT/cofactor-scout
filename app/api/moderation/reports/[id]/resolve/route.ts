import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/database/prisma'
import { logger } from '@/lib/logger'

interface RouteParams {
    params: Promise<{
        id: string
    }>
}

export const dynamic = 'force-dynamic'

export async function POST(
    request: NextRequest,
    { params }: RouteParams
) {
    const requestId = crypto.randomUUID()
    const { id } = await params

    logger.info('Report resolution received', { requestId, reportId: id })

    try {
        const session = await getServerSession(authOptions)
        if (!session?.user || session.user.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Admin access required' },
                { status: 401 }
            )
        }

        const adminId = session.user.id

        const body = await request.json()
        const { action, resolutionNotes } = body

        if (!action || !['resolve', 'dismiss', 'block'].includes(action)) {
            return NextResponse.json(
                { error: 'Invalid action' },
                { status: 400 }
            )
        }

        const report = await prisma.report.findUnique({
            where: { id }
        })

        if (!report) {
            return NextResponse.json(
                { error: 'Report not found' },
                { status: 404 }
            )
        }

        if (report.status !== 'PENDING' && report.status !== 'UNDER_REVIEW') {
            return NextResponse.json(
                { error: 'Report already resolved' },
                { status: 400 }
            )
        }

        let status: 'RESOLVED' | 'DISMISSED' | 'BLOCKED' = 'RESOLVED' // Default initialization, overwritten below
        let resolvedAt: Date | null = null
        let resolvedBy: string | null = null

        switch (action) {
            case 'resolve':
                status = 'RESOLVED'
                resolvedAt = new Date()
                resolvedBy = adminId
                break
            case 'dismiss':
                status = 'DISMISSED'
                break
            case 'block':
                status = 'BLOCKED'
                resolvedAt = new Date()
                resolvedBy = adminId
                break
            default:
                return NextResponse.json(
                    { error: 'Invalid action' },
                    { status: 400 }
                )
        }

        const updatedReport = await prisma.report.update({
            where: { id },
            data: {
                status,
                resolvedAt,
                resolvedBy
            }
        })

        logger.info('Report resolved', {
            requestId,
            reportId: id,
            action,
            adminId
        })

        if (resolutionNotes) {
            logger.info('Report resolution notes', {
                reportId: id,
                notes: resolutionNotes
            })
        }

        return NextResponse.json({
            success: true,
            message: `Report ${action}d successfully`,
            report: {
                id: updatedReport.id,
                status: updatedReport.status,
                resolvedAt: updatedReport.resolvedAt
            }
        })

    } catch (error) {
        logger.error('Failed to resolve report', {
            requestId,
            reportId: id,
            error: error instanceof Error ? error.message : String(error)
        })

        return NextResponse.json(
            { error: 'Failed to resolve report' },
            { status: 500 }
        )
    }
}

export async function GET(
    request: NextRequest,
    { params }: RouteParams
) {
    // Extract ID outside try block to be available in catch
    const { id } = await params;

    try {
        const session = await getServerSession(authOptions)
        if (!session?.user || session.user.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Admin access required' },
                { status: 401 }
            )
        }

        const report = await prisma.report.findUnique({
            where: { id },
            include: {
                reporter: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,

                        createdAt: true
                    }
                },
                resolver: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        })

        if (!report) {
            return NextResponse.json(
                { error: 'Report not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({ report })

    } catch (error) {
        logger.error('Failed to fetch report details', {
            reportId: id,
            error: error instanceof Error ? error.message : String(error)
        })

        return NextResponse.json(
            { error: 'Failed to fetch report' },
            { status: 500 }
        )
    }
}
