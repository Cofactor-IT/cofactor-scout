import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
        return new Response('Unauthorized', { status: 401 })
    }

    // Prisma schema no longer includes a Notification model.
    // Keep the route to avoid breaking clients, but disable the feature.
    await request.json().catch(() => null)
    return Response.json(
        { error: 'Notifications are no longer supported.' },
        { status: 410 }
    )
}
