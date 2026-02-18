import { NextResponse } from 'next/server'

/**
 * DEPRECATED: ExportJob model has been removed
 * GDPR export functionality needs to be reimplemented
 */
export async function POST() {
    return NextResponse.json(
        { error: 'Export functionality is temporarily unavailable' },
        { status: 503 }
    )
}

export async function GET() {
    return NextResponse.json({ exports: [] })
}
