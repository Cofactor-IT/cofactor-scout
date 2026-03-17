import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { addArticle14Job } from '@/lib/queues/article14.queue'
import { prisma } from '@/lib/database/prisma'

export const dynamic = 'force-dynamic'

async function checkAdmin() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return false

  const adminEmail = process.env.ADMIN_EMAIL
  if (!adminEmail) return false

  return session.user.email === adminEmail
}

export async function POST(request: Request) {
  if (!await checkAdmin()) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  try {
    const body = await request.json()
    const { researcherId } = body

    if (!researcherId) {
      return new NextResponse('Missing researcherId', { status: 400 })
    }

    const researcher = await prisma.researcher.findUnique({
      where: { id: researcherId },
    })

    if (!researcher) {
      return new NextResponse('Researcher not found', { status: 404 })
    }

    if (!researcher.institutionalEmail) {
      return new NextResponse(
        'Researcher has no institutional email',
        { status: 400 }
      )
    }

    if (researcher.article14Status === 'SENT') {
      return NextResponse.json({
        success: false,
        message: 'Article 14 notification already sent',
        notifiedAt: researcher.article14NotifiedAt,
      })
    }

    const job = await addArticle14Job(
      researcher.id,
      researcher.institutionalEmail,
      researcher.fullName,
      researcher.source,
      `manual-retry-${Date.now()}`
    )

    if (!job) {
      return new NextResponse('Failed to enqueue retry job', { status: 500 })
    }

    await prisma.researcher.update({
      where: { id: researcherId },
      data: {
        article14Status: 'PENDING',
        article14Attempts: 0,
        article14LastError: null,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Article 14 notification retry enqueued',
      jobId: job.id,
    })
  } catch (error) {
    console.error('Article 14 retry error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
