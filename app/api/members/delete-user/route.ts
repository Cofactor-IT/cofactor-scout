import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-config"
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const userId = formData.get('userId') as string

    if (!userId) {
        return NextResponse.json({ error: 'Missing user ID' }, { status: 400 })
    }

    if (userId === session.user.id) {
        return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 })
    }

    await prisma.user.delete({
        where: { id: userId }
    })

    logger.info('User deleted by admin', { deletedUserId: userId, adminId: session.user.id })

    return NextResponse.redirect(new URL('/members', request.url))
}
