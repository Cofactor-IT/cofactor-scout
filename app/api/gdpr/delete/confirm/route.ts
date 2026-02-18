import { NextResponse } from 'next/server'

/**
 * DEPRECATED: DeletionRequest model has been removed
 */
export async function POST() {
    return NextResponse.json(
        { error: 'Account deletion functionality is temporarily unavailable' },
        { status: 503 }
    )
}
