import { requireAuth } from '@/lib/auth/session'
import { prisma } from '@/lib/database/prisma'
import { redirect } from 'next/navigation'
import { AdminScoutReviewClient } from './client'

export const metadata = {
    title: 'Review Scout Applications | Admin',
}

export default async function AdminScoutsPage() {
    const session = await requireAuth()

    if (session.role !== 'ADMIN') {
        redirect('/dashboard')
    }

    const pendingApplications = await prisma.user.findMany({
        where: {
            scoutApplicationStatus: 'PENDING'
        },
        orderBy: {
            scoutApplicationDate: 'desc'
        },
        select: {
            id: true,
            email: true,
            fullName: true,
            university: true,
            department: true,
            userRole: true,
            userRoleOther: true,
            researchAreas: true,
            whyScout: true,
            howSourceLeads: true,
            linkedinUrl: true,
            scoutApplicationDate: true
        }
    })

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-[120px]">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Scout Applications</h1>
                    <p className="text-gray-600 mt-2">Review and manage pending scout applications.</p>
                </div>

                <AdminScoutReviewClient applications={pendingApplications} />
            </div>
        </div>
    )
}
