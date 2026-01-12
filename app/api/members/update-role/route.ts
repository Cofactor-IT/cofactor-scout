import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-config"
import { prisma } from '@/lib/prisma'
import { Role } from '@prisma/client'

export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const userId = formData.get('userId') as string
    const newRole = formData.get('role') as Role

    if (!userId || !newRole) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (userId === session.user.id) {
        return NextResponse.json({ error: 'Cannot change your own role' }, { status: 400 })
    }

    await prisma.user.update({
        where: { id: userId },
        data: { role: newRole }
    })

    return NextResponse.redirect(new URL('/members', request.url))
}
