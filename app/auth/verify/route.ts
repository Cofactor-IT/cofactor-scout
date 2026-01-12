import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Get the base URL for redirects
function getBaseUrl(): string {
    return process.env.NEXTAUTH_URL || process.env.APP_URL || 'http://localhost:3000'
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
        return NextResponse.redirect(`${getBaseUrl()}/auth/signin?error=Invalid verification link`)
    }

    // Find user with this verification token
    const user = await prisma.user.findUnique({
        where: { verificationToken: token }
    })

    if (!user) {
        return NextResponse.redirect(`${getBaseUrl()}/auth/signin?error=Invalid verification link`)
    }

    // Check if token has expired
    if (user.verificationExpires && user.verificationExpires < new Date()) {
        return NextResponse.redirect(`${getBaseUrl()}/auth/signin?error=Verification link has expired`)
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
    return NextResponse.redirect(`${getBaseUrl()}/auth/signin?message=Email verified! Please sign in.`)
}
