import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/database/prisma'
import { redirect } from 'next/navigation'
import ScoutApplicationForm from './scout-application-form'

export default async function ScoutApplicationPage() {
    const session = await getServerSession(authOptions)

    // If not logged in, show form with empty fields
    if (!session?.user) {
        return <ScoutApplicationForm user={null} />
    }

    // Check if already applied or approved
    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
            fullName: true,
            email: true,
            university: true,
            scoutApplicationStatus: true,
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

    // If application pending or approved, redirect to dashboard
    if (user.scoutApplicationStatus === 'PENDING' || user.scoutApplicationStatus === 'APPROVED') {
        redirect('/dashboard')
    }

    return <ScoutApplicationForm user={user} />
}
