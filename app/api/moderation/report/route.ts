import { NextResponse } from 'next/server'

/**
 * DEPRECATED: WikiRevision model has been removed
 */
export async function POST() {
    return NextResponse.json(
        { error: 'Moderation functionality is temporarily unavailable' },
        { status: 503 }
    )
}
