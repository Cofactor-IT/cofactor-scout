import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/database/prisma'
import Link from 'next/link'
import { FileText, Clock, CheckCircle, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { PromotionBanner } from '@/components/ui/promotion-banner'
import { DashboardNavbar } from '@/components/dashboard-navbar'
import { SubmissionsTable } from '@/components/SubmissionsTable'

async function getDashboardData(userId: string) {
  const submissions = await prisma.researchSubmission.findMany({
    where: { userId, isDraft: false },
    orderBy: { createdAt: 'desc' },
  })

  const totalSubmissions = submissions.length
  const pendingReview = submissions.filter(s => s.status === 'PENDING_RESEARCH' || s.status === 'VALIDATING').length
  const approved = submissions.filter(s => s.status === 'MATCH_MADE').length

  return { submissions, totalSubmissions, pendingReview, approved }
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect('/auth/signin')
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  })

  if (!user) {
    redirect('/auth/signin')
  }

  const { submissions, totalSubmissions, pendingReview, approved } = await getDashboardData(user.id)

  const isScout = user.role === 'SCOUT'
  const displayName = user.fullName || 'User'
  const firstName = user.preferredName || user.firstName || displayName.split(' ')[0]
  const initials = `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() || displayName.slice(0, 2).toUpperCase()

  const statusConfig = {
    PENDING_RESEARCH: { label: 'Pending Research', bg: '#FEF3C7', text: '#92400E' },
    VALIDATING: { label: 'Validating', bg: '#DBEAFE', text: '#1E40AF' },
    MATCH_MADE: { label: 'Match Made', bg: '#D1FAE5', text: '#065F46' },
    PITCHED: { label: 'Pitched/Matchmaking', bg: '#E0E7FF', text: '#3730A3' },
  }

  return (
    <div className="h-screen bg-white flex flex-col overflow-hidden">
      <DashboardNavbar 
        displayName={displayName}
        role={isScout ? 'Verified Scout' : 'Community Contributor'}
        initials={initials}
        profilePictureUrl={user.profilePictureUrl}
        activePage="submissions"
      />

      {/* Hero Section */}
      <section className="bg-[#FAFBFC] h-auto md:h-[150px] flex flex-col justify-center px-4 md:px-8 lg:px-[120px] mt-[70px] flex-shrink-0 py-6 md:py-0">
        <h2 className="mb-[12px]">Welcome, {firstName}!</h2>
        <div className="flex flex-wrap items-center gap-[12px] md:gap-[16px]">
          <div className="flex items-center h-[48px] px-[16px] rounded-full" style={{ backgroundColor: isScout ? '#D1FAE5' : '#E5E7EB' }}>
            <span className="text-[12px] font-normal font-sans" style={{ color: isScout ? '#2D7D46' : '#1B2A4A' }}>
              {isScout ? 'Verified Scout' : 'Community Contributor'}
            </span>
          </div>
          {!isScout && (
            <Link href="/scout/apply">
              <Button className="h-[48px] px-[24px] text-[14px]">
                Apply to be a Scout
              </Button>
            </Link>
          )}
        </div>
      </section>

      {/* Statistics Cards */}
      <section className="bg-[#FAFBFC] h-auto md:h-[180px] flex items-center px-4 md:px-8 lg:px-[120px] flex-shrink-0 py-6 md:py-0">
        <div className="flex gap-[20px] md:gap-[40px] w-full overflow-x-auto md:overflow-x-visible pb-4 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0">
          <Card className="min-w-[280px] md:min-w-0 md:w-full md:flex-1 h-[145px] flex flex-col justify-center px-[24px] shadow-sm flex-shrink-0">
            <FileText className="w-[27px] h-[27px] mb-[10px] text-[#0D7377]" strokeWidth={1.5} />
            <div className="text-[41px] font-bold mb-[3px] text-[#1B2A4A] font-sans">{totalSubmissions}</div>
            <div className="text-[14px] text-[#6B7280]">Total Submissions</div>
          </Card>

          <Card className="min-w-[280px] md:min-w-0 md:w-full md:flex-1 h-[145px] flex flex-col justify-center px-[24px] shadow-sm flex-shrink-0">
            <Clock className="w-[27px] h-[27px] mb-[10px] text-[#F59E0B]" strokeWidth={1.5} />
            <div className="text-[41px] font-bold mb-[3px] text-[#1B2A4A] font-sans">{pendingReview}</div>
            <div className="text-[14px] text-[#6B7280]">Pending Review</div>
          </Card>

          <Card className="min-w-[280px] md:min-w-0 md:w-full md:flex-1 h-[145px] flex flex-col justify-center px-[24px] shadow-sm flex-shrink-0">
            <CheckCircle className="w-[27px] h-[27px] mb-[10px] text-[#2D7D46]" strokeWidth={1.5} />
            <div className="text-[41px] font-bold mb-[3px] text-[#1B2A4A] font-sans">{approved}</div>
            <div className="text-[14px] text-[#6B7280]">Approved</div>
          </Card>
        </div>
      </section>

      {/* CTA Button */}
      <section className="bg-[#FAFBFC] h-auto md:h-[104px] flex items-center justify-center px-4 md:px-8 lg:px-[120px] flex-shrink-0 py-6 md:py-0">
        <Link href="/dashboard/submit">
          <Button className="w-full md:w-[320px] h-[64px] flex items-center justify-center gap-[8px]">
            <Plus className="w-[20px] h-[20px]" />
            Submit Research Lead
          </Button>
        </Link>
      </section>

      {/* Promotion Banner */}
      <div className="flex-shrink-0">
        <PromotionBanner />
      </div>

      {/* Submissions Table */}
      <section className="bg-white py-[40px] md:py-[60px] px-4 md:px-8 lg:px-[120px] flex-1 overflow-y-auto">
        <SubmissionsTable 
          submissions={submissions}
          statusConfig={statusConfig}
        />
      </section>
    </div>
  )
}
