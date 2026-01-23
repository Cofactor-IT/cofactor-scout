import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const universities = await prisma.university.findMany()
        return NextResponse.json({
            status: 'ok',
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
