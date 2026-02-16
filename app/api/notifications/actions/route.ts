import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/database/prisma'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
        return new Response('Unauthorized', { status: 401 })
    }

    const body = await request.json()
    const { action, notificationId } = body

    switch (action) {
        case 'markRead':
            if (notificationId) {
                await prisma.notification.update({
                    where: { id: notificationId, userId: session.user.id },
                    data: { read: true }
                })
                return Response.json({ success: true })
            }
            return new Response('Notification ID required', { status: 400 })

        case 'markAllRead':
            await prisma.notification.updateMany({
                where: { userId: session.user.id },
                data: { read: true }
            })
            return Response.json({ success: true })

        default:
            return new Response('Invalid action', { status: 400 })
    }
}
