import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-config"
import { prisma } from '@/lib/prisma'
import { Role } from '@prisma/client'

// Valid roles from the enum
const VALID_ROLES: Role[] = ['STUDENT', 'PENDING_STAFF', 'STAFF', 'ADMIN']

export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const formData = await request.formData()
    const userId = formData.get('userId') as string
    const newRole = formData.get('role') as string

    if (!userId || !newRole) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Validate role against enum values
    if (!VALID_ROLES.includes(newRole as Role)) {
        return NextResponse.json({ error: 'Invalid role specified' }, { status: 400 })
    }

    if (userId === session.user.id) {
        return NextResponse.json({ error: 'Cannot change your own role' }, { status: 400 })
    }

    await prisma.user.update({
        where: { id: userId },
        data: { role: newRole as Role }
    })

    return NextResponse.json({ success: true, message: 'Role updated successfully' })
}
