import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'

interface RouteParams {
    params: Promise<{
        id: string
    }>
}

export const dynamic = 'force-dynamic'

export async function POST(
    request: NextRequest,
    { params }: RouteParams
) {
    const { id } = await params

    await request.json().catch(() => null)
    const session = await getServerSession(authOptions)
    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json(
        { error: `Moderation reports are no longer supported (report id: ${id}).` },
        { status: 410 }
    )
}

export async function GET(
    request: NextRequest,
    { params }: RouteParams
) {
    await request.json().catch(() => null)
    const { id } = await params

    const session = await getServerSession(authOptions)
    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json(
        { error: `Moderation reports are no longer supported (report id: ${id}).` },
        { status: 410 }
    )
}
