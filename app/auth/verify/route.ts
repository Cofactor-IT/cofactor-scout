import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
        return NextResponse.redirect(new URL('/auth/signin?error=Invalid verification link', request.url))
    }

    // Find user with this verification token
    const user = await prisma.user.findUnique({
        where: { verificationToken: token }
    })

    if (!user) {
        return NextResponse.redirect(new URL('/auth/signin?error=Invalid verification link', request.url))
    }

    // Check if token has expired
    if (user.verificationExpires && user.verificationExpires < new Date()) {
        return NextResponse.redirect(new URL('/auth/signin?error=Verification link has expired', request.url))
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

    // Redirect to signin with success message
    return NextResponse.redirect(new URL('/auth/signin?message=Email verified! Please sign in.', request.url))
}
