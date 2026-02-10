import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { getUserNotifications } from '@/lib/notifications'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
        return new Response('Unauthorized', { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '20', 10)

    const { notifications, total, unread } = await getUserNotifications(
        session.user.id,
        page,
        limit
    )

    return Response.json({
        notifications,
        pagination: {
            page,
            limit,
            total,
            unread,
            totalPages: Math.ceil(total / limit)
        }
    })
}
