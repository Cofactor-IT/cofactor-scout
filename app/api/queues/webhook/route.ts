import { NextResponse } from 'next/server'

/**
 * DEPRECATED: ExportJob model has been removed
 */
export async function POST() {
    return NextResponse.json({ success: true })
}
