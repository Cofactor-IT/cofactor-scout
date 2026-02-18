import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
    await request.json().catch(() => null)
    const session = await getServerSession(authOptions)
    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Prisma schema no longer includes a Report/Moderation model.
    return NextResponse.json(
        { error: 'Moderation reports are no longer supported.' },
        { status: 410 }
    )
}

export async function POST(request: NextRequest) {
    await request.json().catch(() => null)
    const session = await getServerSession(authOptions)
    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json(
        { error: 'Moderation reports are no longer supported.' },
        { status: 410 }
    )
}
