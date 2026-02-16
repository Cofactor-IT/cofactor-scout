'use server'

import { prisma } from '@/lib/database/prisma'
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/config"
import { revalidatePath } from 'next/cache'
import { logger } from '@/lib/logger'

export async function getHistory(slug: string) {
    const uniPage = await prisma.uniPage.findUnique({
        where: { slug }
    })

    if (!uniPage) {
        throw new Error("Page not found")
    }

    const revisions = await prisma.wikiRevision.findMany({
        where: { uniPageId: uniPage.id },
        orderBy: { createdAt: 'desc' },
        include: {
            author: {
                select: {
                    name: true,
                    email: true
                }
            }
        }
    })

    return revisions
}

export async function rollbackToRevision(revisionId: string) {
    const session = await getServerSession(authOptions)

    // Check Admin/Staff permissions
    if (!session || !session.user || (session.user.role !== 'ADMIN' && session.user.role !== 'STAFF')) {
        throw new Error("Unauthorized: Only Admins can perform rollbacks")
    }

    const targetRevision = await prisma.wikiRevision.findUnique({
        where: { id: revisionId },
        include: { uniPage: true }
    })

    if (!targetRevision) {
        throw new Error("Revision not found")
    }

    const uniPage = targetRevision.uniPage

    // Get Admin User ID
    const user = await prisma.user.findUnique({
        where: { email: session.user.email! }
    })

    if (!user) throw new Error("User not found")

    // Create a NEW revision that mirrors the old one
    // This maintains the linear history
    await prisma.wikiRevision.create({
        data: {
            uniPageId: uniPage.id,
            authorId: user.id,
            content: targetRevision.content,
            title: targetRevision.title || uniPage.name, // Use target title if available, else current
            status: 'APPROVED',
            moderationReason: `Rollback to revision from ${targetRevision.createdAt.toISOString()}`
        }
    })

    // Update the actual page content
    await prisma.uniPage.update({
        where: { id: uniPage.id },
        data: {
            content: targetRevision.content,
            name: targetRevision.title || uniPage.name, // Restore title if available
            published: true
        }
    })

    logger.info(`Wiki page ${uniPage.slug} rolled back to revision ${revisionId} by ${user.email}`)

    revalidatePath(`/wiki/${uniPage.slug}`)
    revalidatePath(`/wiki/${uniPage.slug}/history`)
}
