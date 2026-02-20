import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/session'
import { prisma } from '@/lib/database/prisma'

export async function GET() {
  try {
    const session = await requireAuth()
    
    const user = await prisma.user.findUnique({
      where: { id: session.id },
      select: {
        fullName: true,
        firstName: true,
        lastName: true,
        role: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}
