import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
        return new Response('Unauthorized', { status: 401 })
    }

    // Prisma schema no longer includes a Notification model.
    // Keep this route so the UI/clients don't crash, but disable the feature.
    await request.json().catch(() => null)
    return Response.json(
        { notifications: [], pagination: { page: 1, limit: 20, total: 0, unread: 0, totalPages: 0 } },
        { status: 410 }
    )
}
