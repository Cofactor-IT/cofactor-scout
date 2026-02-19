import { NextResponse } from 'next/server'
import { prisma } from '@/lib/database/prisma'
import { logger } from '@/lib/logger'

// Get the base URL for redirects
function getBaseUrl(): string {
    return process.env.NEXTAUTH_URL || process.env.APP_URL || 'http://localhost:3000'
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    logger.info('Email verification attempt', { token: token?.substring(0, 8) })

    if (!token) {
        logger.warn('Verification failed: no token provided')
        return NextResponse.redirect(`${getBaseUrl()}/auth/signin?error=${encodeURIComponent('Invalid verification link')}`)
    }

    try {
        // Find user with this verification token
        const user = await prisma.user.findUnique({
            where: { verificationToken: token }
        })

        if (!user) {
            logger.warn('Verification failed: invalid token', { token: token.substring(0, 8) })
            return NextResponse.redirect(`${getBaseUrl()}/auth/signin?error=${encodeURIComponent('Invalid verification link')}`)
        }

        // Check if token has expired
        if (user.verificationExpires && user.verificationExpires < new Date()) {
            logger.warn('Verification failed: token expired', { email: user.email })
            return NextResponse.redirect(`${getBaseUrl()}/auth/signin?error=${encodeURIComponent('Verification link has expired')}`)
        }

        // Verify email
        await prisma.user.update({
            where: { id: user.id },
            data: {
                emailVerified: new Date(),
                verificationToken: null,
                verificationExpires: null
            }
        })

        logger.info('Email verified successfully', { email: user.email })

        // Redirect to signin with success message
        return NextResponse.redirect(`${getBaseUrl()}/auth/signin?message=${encodeURIComponent('Email verified! You can now sign in.')}`)
    } catch (error) {
        logger.error('Email verification error', { error })
        return NextResponse.redirect(`${getBaseUrl()}/auth/signin?error=${encodeURIComponent('Verification failed. Please try again.')}`)
    }
}
