import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { validateExportId, getExportFilePath } from '@/lib/gdpr/export'
import { createReadStream, existsSync } from 'fs'
import { stat } from 'fs/promises'
import { join } from 'path'

interface RouteParams {
    params: Promise<{
        id: string
    }>
}

export async function GET(
    request: NextRequest,
    { params }: RouteParams
) {
    const { id } = await params
    
    try {
        // Authentication check
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            )
        }
        
        const userId = session.user.id
        
        // Validate export ID format
        if (!validateExportId(id)) {
            return NextResponse.json(
                { error: 'Invalid export ID' },
                { status: 400 }
            )
        }
        
        // Get export job from database
        const exportJob = await prisma.exportJob.findFirst({
            where: {
                id,
                userId
            }
        })
        
        if (!exportJob) {
            return NextResponse.json(
                { error: 'Export not found' },
                { status: 404 }
            )
        }
        
        if (exportJob.status !== 'COMPLETED') {
            return NextResponse.json(
                { 
                    error: 'Export not ready',
                    status: exportJob.status,
                    message: exportJob.status === 'PENDING' 
                        ? 'Your export is still being processed.' 
                        : exportJob.status === 'PROCESSING'
                        ? 'Your export is being generated.'
                        : 'Export generation failed. Please try again.'
                },
                { status: 400 }
            )
        }
        
        if (!exportJob.fileUrl) {
            return NextResponse.json(
                { error: 'Export file not available' },
                { status: 404 }
            )
        }
        
        // Determine which file to serve (prefer JSON if both exist)
        const jsonPath = getExportFilePath(id, 'json')
        const csvPath = getExportFilePath(id, 'csv')
        
        let filePath: string
        let contentType: string
        let filename: string
        
        if (existsSync(jsonPath)) {
            filePath = jsonPath
            contentType = 'application/json'
            filename = `my-data-export-${exportJob.createdAt.toISOString().split('T')[0]}.json`
        } else if (existsSync(csvPath)) {
            filePath = csvPath
            contentType = 'text/csv'
            filename = `my-data-export-${exportJob.createdAt.toISOString().split('T')[0]}.csv`
        } else {
            logger.error('Export file not found on disk', { exportId: id, userId })
            return NextResponse.json(
                { error: 'Export file expired or not found' },
                { status: 404 }
            )
        }
        
        // Check if file has expired (7 days)
        const stats = await stat(filePath)
        const fileAge = Date.now() - stats.mtime.getTime()
        const maxAge = 7 * 24 * 60 * 60 * 1000 // 7 days
        
        if (fileAge > maxAge) {
            return NextResponse.json(
                { 
                    error: 'Export expired',
                    message: 'This export has expired. Please request a new one.'
                },
                { status: 410 }
            )
        }
        
        // Log the download
        logger.info('GDPR export downloaded', {
            exportId: id,
            userId,
            format: contentType
        })
        
        // Read and return the file
        const fileBuffer = await createReadStream(filePath)
        
        return new NextResponse(fileBuffer as unknown as ReadableStream, {
            headers: {
                'Content-Type': contentType,
                'Content-Disposition': `attachment; filename="${filename}"`,
                'X-Content-Type-Options': 'nosniff',
                'X-Frame-Options': 'DENY',
                'Cache-Control': 'private, no-store'
            }
        })
        
    } catch (error) {
        logger.error('Export download failed', {
            exportId: id,
            error: error instanceof Error ? error.message : String(error)
        })
        
        return NextResponse.json(
            { error: 'Failed to download export' },
            { status: 500 }
        )
    }
}
