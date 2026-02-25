import { requireAuth } from '@/lib/auth/session'
import { prisma } from '@/lib/database/prisma'
import { DashboardNavbar } from '@/components/dashboard-navbar'
import { Step1Form } from '@/components/submission/Step1Form'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Submit Research Lead | Cofactor Scout',
  description: 'Submit a promising research lead to connect with venture capital investors.'
}

export default async function SubmitPage() {
  const session = await requireAuth()
  
  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: {
      fullName: true,
      firstName: true,
      lastName: true,
      role: true
    }
  })

  if (!user) return null

  const isScout = user.role === 'SCOUT'
  const displayName = user.fullName || 'User'
  const initials = `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() || displayName.slice(0, 2).toUpperCase()

  return (
    <div className="min-h-screen bg-[#FAFBFC]">
      <DashboardNavbar 
        displayName={displayName}
        role={isScout ? 'Verified Scout' : 'Community Contributor'}
        initials={initials}
        activePage="submissions"
      />
      <Step1Form />
    </div>
  )
}
