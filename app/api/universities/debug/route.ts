import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

try {
    const dbUrl = process.env.DATABASE_URL || 'not set'
    // Mask password for security
    const maskedUrl = dbUrl.replace(/:([^:@]+)@/, ':****@')

    const universities = await prisma.university.findMany()
    return NextResponse.json({
        status: 'ok',
        database_url_used: maskedUrl,
        count: universities.length,
        universities
    })
} catch (error) {
    return NextResponse.json({
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
        error
    }, { status: 500 })
}
}
