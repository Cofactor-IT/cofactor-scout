import { NextResponse } from 'next/server'

/**
 * DEPRECATED: Person, Lab, Institute models have been removed
 */
export async function GET() {
    return NextResponse.json({ people: [], labs: [], institutes: [] })
}
