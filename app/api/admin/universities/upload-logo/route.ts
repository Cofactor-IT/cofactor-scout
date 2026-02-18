import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
    // Prisma schema no longer includes University models; disable this endpoint.
    await request.formData().catch(() => null)
    return NextResponse.json(
        { error: 'University management is no longer supported.' },
        { status: 410 }
    )
}
