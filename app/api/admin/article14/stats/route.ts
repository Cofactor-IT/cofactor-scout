import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/database/prisma'

export const dynamic = 'force-dynamic'

async function checkAdmin() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return false

  const adminEmail = process.env.ADMIN_EMAIL
  if (!adminEmail) return false

  return session.user.email === adminEmail
}

export async function GET() {
  if (!await checkAdmin()) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  try {
    const [
      totalResearchers,
      notifiedResearchers,
      pendingResearchers,
      failedResearchers,
      noEmailResearchers,
    ] = await Promise.all([
      prisma.researcher.count(),
      prisma.researcher.count({
        where: { article14Status: 'SENT' },
      }),
      prisma.researcher.count({
        where: { article14Status: 'PENDING' },
      }),
      prisma.researcher.count({
        where: { article14Status: 'FAILED' },
      }),
      prisma.researcher.count({
        where: { article14Status: 'NOT_REQUIRED' },
      }),
    ])

    const notifiedRate = totalResearchers > 0
      ? ((notifiedResearchers / totalResearchers) * 100).toFixed(1)
      : '0.0'

    return NextResponse.json({
      totalResearchers,
      notifiedResearchers,
      pendingResearchers,
      failedResearchers,
      noEmailResearchers,
      notifiedRate: `${notifiedRate}%`,
      sources: await getSourceBreakdown(),
    })
  } catch (error) {
    console.error('Article 14 stats error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

async function getSourceBreakdown() {
  const results = await prisma.researcher.groupBy({
    by: ['source'],
    _count: {
      _all: true,
    },
  })

  return results
    .map((r: any) => ({
      source: r.source,
      count: r._count._all,
    }))
    .sort((a: { count: number }, b: { count: number }) => b.count - a.count)
}
