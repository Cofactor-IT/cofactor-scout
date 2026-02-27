/**
 * page.tsx
 * 
 * Scout application page with status-aware rendering.
 * 
 * Flows:
 * - Not logged in: Show empty application form
 * - Already Scout: Redirect to dashboard
 * - Pending application: Show status with reminder option
 * - Expired application (>30 days): Reset and allow reapplication
 * - Not applied: Show application form
 * 
 * Server component that checks authentication and application status.
 */

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/database/prisma'
import { redirect } from 'next/navigation'
import ScoutApplicationForm from './scout-application-form'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Apply to Be a Scout | Cofactor Scout',
  description: 'Apply to become a verified Cofactor Scout and earn higher commission rates.'
}

// Applications expire after 30 days, allowing users to reapply
const ONE_MONTH_MS = 30 * 24 * 60 * 60 * 1000

/**
 * Scout application page component.
 * Determines which view to show based on user authentication and application status.
 */
export default async function ScoutApplicationPage() {
    const session = await getServerSession(authOptions)

    // Unauthenticated users can fill out application
    if (!session?.user) {
        return <ScoutApplicationForm user={null} applicationStatus={null} />
    }

    // Fetch user data to check application status
    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
            fullName: true,
            email: true,
            university: true,
            scoutApplicationStatus: true,
            scoutApplicationDate: true,
            role: true
        }
    })

    if (!user) {
        redirect('/auth/signin')
    }

    // Already promoted to Scout role - redirect to dashboard
    if (user.role === 'SCOUT') {
        redirect('/dashboard')
    }

    // Check if pending application has expired (>30 days)
    if (user.scoutApplicationStatus === 'PENDING' && user.scoutApplicationDate) {
        const applicationAge = Date.now() - user.scoutApplicationDate.getTime()
        if (applicationAge > ONE_MONTH_MS) {
            // Reset application status to allow reapplication
            await prisma.user.update({
                where: { id: session.user.id },
                data: {
                    scoutApplicationStatus: 'NOT_APPLIED',
                    scoutApplicationDate: null
                }
            })
            return <ScoutApplicationForm user={user} applicationStatus={null} />
        }
    }

    // Show pending status with reminder option
    if (user.scoutApplicationStatus === 'PENDING') {
        return <ScoutApplicationForm 
            user={user} 
            applicationStatus={{
                status: 'PENDING',
                applicationDate: user.scoutApplicationDate!
            }} 
        />
    }

    // Approved applications should have Scout role - redirect anyway
    if (user.scoutApplicationStatus === 'APPROVED') {
        redirect('/dashboard')
    }

    return <ScoutApplicationForm user={user} applicationStatus={null} />
}
