'use server'

import { prisma } from '@/lib/database/prisma'
import { revalidatePath } from 'next/cache'
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/config"

async function requireAdmin() {
    const session = await getServerSession(authOptions)
    if (!session?.user?.role || session.user.role !== 'ADMIN') {
        throw new Error("Access Denied")
    }
}

export async function toggleTrustedStatus(userId: string) {
    await requireAdmin()

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) throw new Error("User not found")

    await prisma.user.update({
        where: { id: userId },
        data: { isTrusted: !user.isTrusted }
    })

    revalidatePath('/members')
}
