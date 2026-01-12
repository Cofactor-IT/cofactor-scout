import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-config"
import { prisma } from '@/lib/prisma'
import { randomBytes } from 'crypto'
import { logger } from '@/lib/logger'

function generateToken(): string {
    return randomBytes(32).toString('hex')
}

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

    const user = await prisma.user.findUnique({
        where: { id: userId }
    })

    if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const resetToken = generateToken()
    const expires = new Date(Date.now() + 60 * 60 * 1000)

    await prisma.passwordReset.deleteMany({
        where: { userId: user.id }
    })

    await prisma.passwordReset.create({
        data: {
            token: resetToken,
            userId: user.id,
            expires
        }
    })

    const { sendPasswordResetEmail } = await import('@/lib/email')
    sendPasswordResetEmail(user.email, resetToken).catch(err =>
        logger.error('Failed to send password reset email', { email: user.email, error: err })
    )

    logger.info('Password reset requested by admin', { targetUserId: userId, adminId: session.user.id })

    return NextResponse.redirect(new URL('/members', request.url))
}
