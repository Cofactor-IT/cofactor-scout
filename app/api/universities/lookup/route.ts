import { NextResponse } from 'next/server'

/**
 * DEPRECATED: University model has been removed
 */
export async function GET() {
    return NextResponse.json({
        university: null,
        isPersonalEmail: false,
        domain: ''
    })
}
