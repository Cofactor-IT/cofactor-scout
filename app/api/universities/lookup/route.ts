import { NextResponse } from 'next/server'
import { prisma } from '@/lib/database/prisma'
import { extractEmailDomain, isPersonalEmail, findUniversityByDomain } from '@/lib/utils/university'
import { checkRateLimit, getClientIp } from '@/lib/security/rate-limit'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
    const ip = getClientIp(request)
    const rateLimitResult = checkRateLimit(ip, {
        limit: 60,
        window: 60 * 1000
    })

    if (!rateLimitResult.success) {
        return NextResponse.json(
            { error: 'Too many requests' },
            { status: 429 }
        )
    }

    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    const domain = searchParams.get('domain')

    const targetDomain = domain || (email ? extractEmailDomain(email) : null)

    if (!targetDomain) {
        return NextResponse.json({ error: 'Email or domain parameter required' }, { status: 400 })
    }

    const personalEmail = email ? isPersonalEmail(email) : false

    let university = null
    let isStaffDomain = false

    // University lookup removed - current schema stores university as string
    // The signup form will accept manual university name input

    return NextResponse.json({
        university: university || null,
        isStaffDomain,
        isPersonalEmail: personalEmail,
        domain: targetDomain
    })
}
