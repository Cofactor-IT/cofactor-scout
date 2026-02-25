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

const ONE_MONTH_MS = 30 * 24 * 60 * 60 * 1000

export default async function ScoutApplicationPage() {
    const session = await getServerSession(authOptions)

    // If not logged in, show form with empty fields
    if (!session?.user) {
        return <ScoutApplicationForm user={null} applicationStatus={null} />
    }

    // Check if already applied or approved
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

    // If already a scout, redirect to dashboard
    if (user.role === 'SCOUT') {
        redirect('/dashboard')
    }

    // Check if application is older than 1 month - allow reapplication
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

    // If application pending, show status
    if (user.scoutApplicationStatus === 'PENDING') {
        return <ScoutApplicationForm 
            user={user} 
            applicationStatus={{
                status: 'PENDING',
                applicationDate: user.scoutApplicationDate!
            }} 
        />
    }

    // If application approved, redirect to dashboard
    if (user.scoutApplicationStatus === 'APPROVED') {
        redirect('/dashboard')
    }

    return <ScoutApplicationForm user={user} applicationStatus={null} />
}
