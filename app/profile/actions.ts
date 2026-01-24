'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'

/**
 * Request association with a secondary university
 * User must provide proof text explaining their affiliation
 */
export async function requestSecondaryUniversity(universityId: string, proofText: string) {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
        return { error: 'You must be logged in to request a secondary university' }
    }

    if (!universityId?.trim()) {
        return { error: 'Please select a university' }
    }

    if (!proofText?.trim()) {
        return { error: 'Please provide proof of your affiliation (e.g., exchange program details, collaboration letter)' }
    }

    if (proofText.trim().length < 20) {
        return { error: 'Please provide more details about your affiliation (at least 20 characters)' }
    }

    // Fetch user to check their primary university
    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { universityId: true, secondaryUniversityId: true }
    })

    if (!user) {
        return { error: 'User not found' }
    }

    // Cannot request your own primary university
    if (user.universityId === universityId) {
        return { error: 'You cannot request your primary university as a secondary university' }
    }

    // Cannot request if already approved
    if (user.secondaryUniversityId === universityId) {
        return { error: 'You are already associated with this university' }
    }

    // Check if there's already a pending request for this university
    const existingRequest = await prisma.secondaryUniversityRequest.findFirst({
        where: {
            userId: session.user.id,
            universityId,
            status: 'PENDING'
        }
    })

    if (existingRequest) {
        return { error: 'You already have a pending request for this university' }
    }

    try {
        await prisma.secondaryUniversityRequest.create({
            data: {
                userId: session.user.id,
                universityId,
                proofText: proofText.trim()
            }
        })

        revalidatePath('/profile')
        return { success: true }
    } catch (error) {
        console.error('Failed to create secondary university request:', error)
        return { error: 'Failed to submit request. Please try again.' }
    }
}

/**
 * Cancel a pending secondary university request
 */
export async function cancelSecondaryRequest(requestId: string) {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
        return { error: 'You must be logged in' }
    }

    const request = await prisma.secondaryUniversityRequest.findUnique({
        where: { id: requestId }
    })

    if (!request) {
        return { error: 'Request not found' }
    }

    if (request.userId !== session.user.id) {
        return { error: 'You can only cancel your own requests' }
    }

    if (request.status !== 'PENDING') {
        return { error: 'Can only cancel pending requests' }
    }

    await prisma.secondaryUniversityRequest.delete({
        where: { id: requestId }
    })

    revalidatePath('/profile')
    return { success: true }
}

/**
 * Get all approved universities for the dropdown
 */
export async function getApprovedUniversities() {
    try {
        return await prisma.university.findMany({
            where: { approved: true },
            orderBy: { name: 'asc' },
            select: {
                id: true,
                name: true
            }
        })
    } catch (error) {
        console.error('Failed to fetch universities:', error)
        return []
    }
}

/**
 * Get user's pending secondary university request
 */
export async function getPendingRequest() {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
        return null
    }

    return prisma.secondaryUniversityRequest.findFirst({
        where: {
            userId: session.user.id,
            status: 'PENDING'
        },
        include: {
            university: {
                select: { name: true }
            }
        }
    })
}
