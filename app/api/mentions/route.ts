import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-config"

export async function GET(request: Request) {
    const session = await getServerSession(authOptions)
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('query')

    if (!query || query.length < 2) {
        return NextResponse.json([])
    }

    // Parallel search across People, Labs, Institutes
    // We limit to 5 of each to keep it snappy
    const [people, labs, institutes] = await Promise.all([
        prisma.person.findMany({
            where: { name: { contains: query, mode: 'insensitive' } },
            take: 5,
            select: { id: true, name: true, role: true }
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
            id: `person:${p.id}`,
            display: p.name,
            type: 'Person',
            link: `/wiki/people/${p.id}` // We might need a person view or scroll anchor? For now assuming specific route or placeholder.
            // Actually we don't have a /wiki/people/[id] page yet? We have /wiki/institutes/[slug] which lists people.
            // Maybe we link to the user profile or just a social search?
            // Let's link to the search for now or just text? 
            // Wait, we can link to the institute/lab they belong to?
            // For now, let's just make it a non-clickable span or link to hash?
            // "People" usually don't have their own page in this wiki structure yet, they are just cards.
            // Let's defer linking people until we have a person page. Or maybe linking to their institute?
            // Let's just store the name.
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
