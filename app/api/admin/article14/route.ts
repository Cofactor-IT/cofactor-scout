import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { getArticle14AuditLog } from '@/lib/services/article14-audit'

export const dynamic = 'force-dynamic'

async function checkAdmin() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return false

  const adminEmail = process.env.ADMIN_EMAIL
  if (!adminEmail) return false

  return session.user.email === adminEmail
}

export async function GET(request: Request) {
  if (!await checkAdmin()) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1', 10)
    const pageSize = parseInt(searchParams.get('pageSize') || '50', 10)
    const status = searchParams.get('status') as any
    const source = searchParams.get('source') as any
    const from = searchParams.get('from')
    const to = searchParams.get('to')

    const result = await getArticle14AuditLog({
      page,
      pageSize,
      ...(status && { status }),
      ...(source && { source }),
      ...(from && { from: new Date(from) }),
      ...(to && { to: new Date(to) }),
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Article 14 audit log error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
