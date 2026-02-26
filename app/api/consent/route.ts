import { NextResponse } from 'next/server'
import { prisma } from '@/lib/database/prisma'
import { headers } from 'next/headers'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import crypto from 'crypto'

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

        // Hash IP to avoid storing raw PII
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
    } catch (e) {
        // Silent failure to not break user experience on consent accept
        return NextResponse.json({ error: 'Failed' }, { status: 500 })
    }
}
