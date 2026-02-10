import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-config"
import { checkRateLimit } from '@/lib/rate-limit'

export async function GET(request: Request) {
    const session = await getServerSession(authOptions)
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const rateLimitResult = checkRateLimit(session.user.id, {
        limit: 100,
        window: 60 * 60 * 1000
    })

    if (!rateLimitResult.success) {
        return NextResponse.json(
            { error: 'Too many requests' },
            {
                status: 429,
                headers: {
                    'X-RateLimit-Remaining': '0',
                    'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString()
                }
            }
        )
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('query')

    if (!query || query.length < 1 || query.length > 100) {
        return NextResponse.json([])
    }

    // Parallel search across People, Labs, Institutes
    // We limit to 5 of each to keep it snappy
    const [people, labs, institutes] = await Promise.all([
        prisma.person.findMany({
            where: { name: { contains: query, mode: 'insensitive' } },
            take: 5,
            select: { id: true, name: true, slug: true, role: true }
        }),
        prisma.lab.findMany({
            where: {
                name: { contains: query, mode: 'insensitive' },
                approved: true
            },
            take: 5,
            select: { id: true, name: true, slug: true }
        }),
        prisma.institute.findMany({
            where: {
                name: { contains: query, mode: 'insensitive' },
                approved: true
            },
            take: 5,
            select: { id: true, name: true, slug: true }
        })
    ])

    const results = [
        ...people.map(p => ({
            id: `person:${p.slug}`,
            display: p.name,
            type: 'Person',
            link: `/wiki/people/${p.slug}`
        })),
        ...labs.map(l => ({
            id: `lab:${l.slug}`,
            display: l.name,
            type: 'Lab',
            link: `/wiki/labs/${l.slug}`
        })),
        ...institutes.map(i => ({
            id: `institute:${i.slug}`,
            display: i.name,
            type: 'Institute',
            link: `/wiki/institutes/${i.slug}`
        }))
    ]

    return NextResponse.json(results)
}
