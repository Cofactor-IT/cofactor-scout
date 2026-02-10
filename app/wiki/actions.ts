'use server'

import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-config"
import { POWER_SCORE } from '@/lib/types'
import { wikiSubmissionSchema, wikiSlugSchema } from '@/lib/validation'
import { sanitizeHtmlContent, containsSqlInjection } from '@/lib/sanitization'
import { moderateContent } from '@/lib/moderation'
import { logger } from '@/lib/logger'

export async function proposeEdit(formData: FormData) {
    const slug = formData.get('slug') as string
    const rawContent = formData.get('content') as string
    const uniName = formData.get('uniName') as string

    // Validate slug format
    const slugValidation = wikiSlugSchema.safeParse(slug)
    if (!slugValidation.success) {
        throw new Error('Invalid page slug format')
    }

    // Validate and sanitize content
    const contentValidation = wikiSubmissionSchema.shape.content.safeParse(rawContent)
    if (!contentValidation.success) {
        throw new Error(contentValidation.error.issues[0].message)
    }

    // Sanitize content with DOMPurify
    const content = sanitizeHtmlContent(rawContent)

    // 1. Get authenticated user
    const session = await getServerSession(authOptions)
    if (!session || !session.user || !session.user.email) {
        redirect('/api/auth/signin')
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
    })

    if (!user) {
        throw new Error("User not found")
    }

    const isAdminOrStaff = user.role === 'ADMIN' || user.role === 'STAFF'

    // MODERATION CHECK: Run comprehensive moderation for non-admins
    if (!isAdminOrStaff) {
        const moderationResult = await moderateContent(content, user.id, {
            title: uniName,
            contentType: 'wiki'
        })

        if (moderationResult.action === 'reject') {
            logger.warn('Wiki submission rejected by moderation', {
                userId: user.id,
                reason: moderationResult.reason,
                spamScore: moderationResult.spamScore
            })
            throw new Error(`Content rejected: ${moderationResult.reason}`)
        }
    }

    // 2. Find or Create UniPage
    let uniPage = await prisma.uniPage.findUnique({
        where: { slug: slugValidation.data }
    })

    // Access Control Logic
    if (user.role === 'STUDENT') {
        if (!user.universityId) {
            throw new Error("You must belong to a university to edit wiki pages.")
        }

        if (uniPage && uniPage.universityId && uniPage.universityId !== user.universityId) {
            throw new Error("You can only edit pages for your own university.")
        }
    }

    if (!uniPage) {
        if (!uniName) throw new Error("Page Title required for new page")

        // Validate page name for SQL injection
        if (containsSqlInjection(uniName)) {
            throw new Error("Invalid page name")
        }

        // Sanitize and validate page name
        const sanitizedUniName = uniName.trim().replace(/[<>{}]/g, '').substring(0, 200)
        if (sanitizedUniName.length < 1) {
            throw new Error("Page name is too short")
        }

        // Determine hierarchy context
        let targetUniversityId = user.universityId
        let targetInstituteId: string | null = null
        let targetLabId: string | null = null

        const formUniversityId = formData.get('universityId') as string
        const formInstituteId = formData.get('instituteId') as string
        const formLabId = formData.get('labId') as string

        // Validate IDs if provided
        if (formLabId && !/^[a-z0-9]+$/i.test(formLabId)) {
            throw new Error("Invalid lab ID")
        }
        if (formInstituteId && !/^[a-z0-9]+$/i.test(formInstituteId)) {
            throw new Error("Invalid institute ID")
        }
        if (formUniversityId && !/^[a-z0-9]+$/i.test(formUniversityId)) {
            throw new Error("Invalid university ID")
        }

        if (formLabId) {
            const lab = await prisma.lab.findUnique({
                where: { id: formLabId },
                include: { institute: true }
            })
            if (lab) {
                targetLabId = lab.id
                targetInstituteId = lab.instituteId
                targetUniversityId = lab.institute.universityId
            }
        } else if (formInstituteId) {
            const inst = await prisma.institute.findUnique({ where: { id: formInstituteId } })
            if (inst) {
                targetInstituteId = inst.id
                targetUniversityId = inst.universityId
            }
        } else if (isAdminOrStaff && formUniversityId) {
            targetUniversityId = formUniversityId
        }

        // Verify access
        if (!isAdminOrStaff && targetUniversityId !== user.universityId) {
            throw new Error("You can only create articles for your own university structure")
        }

        uniPage = await prisma.uniPage.create({
            data: {
                name: sanitizedUniName,
                slug: slugValidation.data,
                universityId: targetUniversityId,
                instituteId: targetInstituteId,
                labId: targetLabId,
                content: isAdminOrStaff ? content : '',
                published: isAdminOrStaff ? true : false
            }
        })
    } else if (isAdminOrStaff) {
        // If page exists and user is admin, update usage content directly
        await prisma.uniPage.update({
            where: { id: uniPage.id },
            data: {
                content,
                published: true
            }
        })
    }

    // 3. Create Revision Record
    // If Admin/Staff -> Status APPROVED
    // If Student -> Status PENDING
    let status: 'APPROVED' | 'PENDING' | 'REJECTED' | 'AUTO_REJECTED' | 'FLAGGED' = isAdminOrStaff ? 'APPROVED' : 'PENDING'
    let spamScore: number | null = null
    let filterViolations: any = null

    // For non-admins, run moderation and determine status
    if (!isAdminOrStaff) {
        const moderationResult = await moderateContent(content, user.id, {
            title: uniName,
            contentType: 'wiki'
        })

        spamScore = moderationResult.spamScore
        filterViolations = moderationResult.filterViolations.length > 0
            ? moderationResult.filterViolations
            : undefined

        // Auto-approve if trusted and clean
        if (moderationResult.reputation.canAutoApprove && moderationResult.action === 'approve') {
            status = 'APPROVED'
        }

        // Auto-reject if spam score is too high
        if (moderationResult.action === 'reject') {
            status = 'AUTO_REJECTED'
            logger.warn('Wiki submission auto-rejected', {
                userId: user.id,
                spamScore: moderationResult.spamScore,
                reason: moderationResult.reason
            })
            throw new Error(`Content rejected: ${moderationResult.reason}`)
        }

        // Flag for review if needed
        if (moderationResult.needsReview) {
            status = 'PENDING'
        }
    }

    await prisma.wikiRevision.create({
        data: {
            uniPageId: uniPage.id,
            authorId: user.id,
            content,
            status,
            spamScore,
            filterViolations
        }
    })

    // 4. Increment Power Score
    // Usually yes, even admins get points (or we ignore it for them).
    // Let's give points to incentivize or track activity.
    if (status === 'APPROVED') {
        await prisma.user.update({
            where: { id: user.id },
            data: { powerScore: { increment: POWER_SCORE.WIKI_APPROVAL_POINTS } }
        })
    }

    // revalidatePath only works if we don't redirect inside it?
    // standard pattern: revalidate then redirect.
    revalidatePath(`/wiki/${slugValidation.data}`)

    if (status === 'APPROVED') {
        // If approved instantly, go back to page
        redirect(`/wiki/${slugValidation.data}`)
    } else {
        // If pending, go to thank you
        redirect(`/wiki/${slugValidation.data}/thank-you`)
    }
}
