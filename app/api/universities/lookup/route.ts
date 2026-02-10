import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { extractEmailDomain, isPersonalEmail, findUniversityByDomain } from '@/lib/universityUtils'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'

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

    try {
        const staffDomainRecord = await prisma.staffDomain.findUnique({
            where: { domain: targetDomain }
        })
        if (staffDomainRecord) {
            isStaffDomain = true
        }

        const foundUniversity = await findUniversityByDomain(targetDomain)

        if (foundUniversity) {
            university = {
                id: foundUniversity.id,
                name: foundUniversity.name
            }
        }
    } catch (error) {
        console.error('Database error in university lookup:', error)
    }

    return NextResponse.json({
        university: university || null,
        isStaffDomain,
        isPersonalEmail: personalEmail,
        domain: targetDomain
    })
}
