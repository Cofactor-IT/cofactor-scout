import { NextResponse } from 'next/server'

/**
 * DEPRECATED: ExportJob model has been removed
 */
export async function GET() {
    return NextResponse.json(
        { error: 'Export download functionality is temporarily unavailable' },
        { status: 503 }
    )
}
