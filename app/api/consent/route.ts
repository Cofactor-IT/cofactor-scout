/**
 * @file route.ts
 * @description API endpoint for recording cookie consent preferences.
 * Logs consent choices to the database with hashed IP for privacy.
 */
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/database/prisma'
import { headers } from 'next/headers'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import crypto from 'crypto'

/**
 * Records user consent preferences to the database.
 * @param req - Request containing consent preferences (analytics, error)
 * @returns Success response or error status
 */
export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { analytics, error } = body

        if (typeof analytics !== 'boolean' || typeof error !== 'boolean') {
            return NextResponse.json({ error: 'Invalid consent data' }, { status: 400 })
        }

        const session = await getServerSession(authOptions)
        const headersList = await headers()

        let ipAddress = headersList.get('x-forwarded-for') ||
            headersList.get('x-real-ip') ||
            null

        /* Hash IP address to avoid storing raw PII */
        if (ipAddress) {
            ipAddress = crypto.createHash('sha256').update(ipAddress).digest('hex')
        }

        const userAgent = headersList.get('user-agent') || 'unknown'

        await prisma.consentRecord.create({
            data: {
                userId: session?.user?.id || null,
                analytics,
                error,
                userAgent,
                ipAddress
            }
        })

        return NextResponse.json({ success: true })
    } catch {
        /* Silent failure — consent recording must never break the user experience */
        return NextResponse.json({ error: 'Failed' }, { status: 500 })
    }
}
