import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/database/prisma'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user || session.user.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Admin access required' },
                { status: 401 }
            )
        }
        
        const { searchParams } = new URL(request.url)
        
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '20')
        const status = searchParams.get('status')
        const contentType = searchParams.get('contentType')
        
        const where: Record<string, any> = {}
        
        if (status) {
            where.status = status
        }
        
        if (contentType) {
            where.contentType = contentType
        }
        
        const [reports, totalCount] = await Promise.all([
            prisma.report.findMany({
                where,
                include: {
                    reporter: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            role: true
                        }
                    },
                    resolver: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' as const },
                skip: (page - 1) * limit,
                take: limit
            }),
            prisma.report.count({ where })
        ])
        
        return NextResponse.json({
            reports,
            pagination: {
                page,
                limit,
                total: totalCount,
                pages: Math.ceil(totalCount / limit)
            }
        })
        
    } catch (error) {
        logger.error('Failed to fetch reports', {
            error: error instanceof Error ? error.message : String(error)
        })
        
        return NextResponse.json(
            { error: 'Failed to fetch reports' },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
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
        const { action, reportIds } = body
        
        if (!action || !Array.isArray(reportIds) || reportIds.length === 0) {
            return NextResponse.json(
                { error: 'Invalid request body' },
                { status: 400 }
            )
        }
        
        if (action === 'bulk_approve' || action === 'bulk_dismiss') {
            const newStatus = action === 'bulk_approve' ? 'RESOLVED' : 'DISMISSED'
            const resolvedBy = action === 'bulk_approve' ? adminId : null
            
            const result = await prisma.report.updateMany({
                where: {
                    id: { in: reportIds },
                    status: { in: ['PENDING', 'UNDER_REVIEW'] }
                },
                data: {
                    status: newStatus,
                    resolvedAt: action === 'bulk_approve' ? new Date() : null,
                    resolvedBy
                }
            })
            
            logger.info('Bulk report action', {
                action,
                adminId,
                count: result.count
            })
            
            return NextResponse.json({
                success: true,
                message: `${result.count} reports ${action === 'bulk_approve' ? 'resolved' : 'dismissed'}`
            })
        }
        
        return NextResponse.json(
            { error: 'Invalid action' },
            { status: 400 }
        )
        
    } catch (error) {
        logger.error('Failed to perform bulk report action', {
            error: error instanceof Error ? error.message : String(error)
        })
        
        return NextResponse.json(
            { error: 'Failed to perform action' },
            { status: 500 }
        )
    }
}
