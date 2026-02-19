import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/database/prisma'
import Link from 'next/link'
import Image from 'next/image'
import NavbarLogo from '@/public/cofactor-scout-navbar-logo.png'
import { FileText, Clock, CheckCircle, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { UserDropdown } from '@/components/ui/user-dropdown'
import { PromotionBanner } from '@/components/ui/promotion-banner'
import { Dropdown } from '@/components/ui/dropdown'

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
  const firstName = user.firstName || displayName.split(' ')[0]
  const initials = `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() || displayName.slice(0, 2).toUpperCase()

  const statusConfig = {
    PENDING_RESEARCH: { label: 'Pending Research', bg: '#FEF3C7', text: '#92400E' },
    VALIDATING: { label: 'Validating', bg: '#DBEAFE', text: '#1E40AF' },
    MATCH_MADE: { label: 'Match Made', bg: '#D1FAE5', text: '#065F46' },
    PITCHED: { label: 'Pitched/Matchmaking', bg: '#E0E7FF', text: '#3730A3' },
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="h-[80px] bg-[#E5E7EB] px-[8.33vw] flex items-center justify-between">
        <Image 
          src={NavbarLogo} 
          alt="CofactorScout" 
          width={150} 
          height={30}
          className="h-[2.08vw] w-auto"
        />
        
        <div className="flex items-center gap-[3.33vw]">
          <Link href="/dashboard" className="underline text-[#1B2A4A] text-[17.5px]">My Submissions</Link>
          <Link href="/dashboard/drafts" className="text-[#1B2A4A] text-[17.5px]">My Drafts</Link>
          
          <UserDropdown 
            displayName={displayName}
            role={isScout ? 'Verified Scout' : 'Community Contributor'}
            initials={initials}
          />
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-[#FAFBFC] h-[13.91vw] flex flex-col justify-center px-[8.33vw]">
        <h2 className="mb-[0.83vw]">Welcome, {firstName}!</h2>
        <div className="flex items-center gap-[1.11vw]">
          <div className="inline-block px-[1.11vw] py-[0.42vw] rounded-full" style={{ backgroundColor: isScout ? '#D1FAE5' : '#E5E7EB' }}>
            <span className="caption" style={{ color: isScout ? '#2D7D46' : '#1B2A4A' }}>
              {isScout ? 'Verified Scout' : 'Community Contributor'}
            </span>
          </div>
          {!isScout && (
            <Link href="/scout/apply">
              <Button className="h-[2.78vw] px-[1.67vw] flex items-center justify-center">
                <span className="caption">Apply to be a Scout</span>
              </Button>
            </Link>
          )}
        </div>
      </section>

      {/* Statistics Cards */}
      <section className="bg-[#FAFBFC] h-[12.5vw] flex items-center px-[8.33vw]">
        <div className="flex justify-center gap-[2.78vw] w-full">
          <Card className="w-[25.93vw] h-[10.1vw] flex flex-col justify-center px-[1.67vw] shadow-sm">
            <FileText className="w-[1.89vw] h-[1.89vw] mb-[0.71vw] text-[#0D7377]" strokeWidth={1.5} />
            <div className="text-[2.83vw] font-bold mb-[0.24vw] text-[#1B2A4A] font-sans">{totalSubmissions}</div>
            <div className="caption text-[#6B7280]">Total Submissions</div>
          </Card>

          <Card className="w-[25.93vw] h-[10.1vw] flex flex-col justify-center px-[1.67vw] shadow-sm">
            <Clock className="w-[1.89vw] h-[1.89vw] mb-[0.71vw] text-[#F59E0B]" strokeWidth={1.5} />
            <div className="text-[2.83vw] font-bold mb-[0.24vw] text-[#1B2A4A] font-sans">{pendingReview}</div>
            <div className="caption text-[#6B7280]">Pending Review</div>
          </Card>

          <Card className="w-[25.93vw] h-[10.1vw] flex flex-col justify-center px-[1.67vw] shadow-sm">
            <CheckCircle className="w-[1.89vw] h-[1.89vw] mb-[0.71vw] text-[#2D7D46]" strokeWidth={1.5} />
            <div className="text-[2.83vw] font-bold mb-[0.24vw] text-[#1B2A4A] font-sans">{approved}</div>
            <div className="caption text-[#6B7280]">Approved</div>
          </Card>
        </div>
      </section>

      {/* CTA Button */}
      <section className="bg-[#FAFBFC] h-[7.22vw] flex items-center justify-center px-[8.33vw]">
        <Link href="/dashboard/submit">
          <Button className="w-[22.22vw] h-[4.44vw] flex items-center justify-center gap-[0.56vw]">
            <Plus className="w-[1.39vw] h-[1.39vw]" />
            Submit Research Lead
          </Button>
        </Link>
      </section>

      {/* Promotion Banner */}
      <PromotionBanner />

      {/* Submissions Table */}
      <section className="bg-white py-[4.17vw] px-[8.33vw]">
        <div className="flex items-center justify-between mb-[2.22vw]">
          <h3>My Submissions</h3>
          <Dropdown>
            <option>All Submissions</option>
            <option>Pending</option>
            <option>Approved</option>
          </Dropdown>
        </div>

        <div className="border border-[#E5E7EB] rounded-[4px]">
          {/* Table Header */}
          <div className="grid grid-cols-[2fr_3fr_2fr_1.5fr_1fr] gap-[1.67vw] px-[1.67vw] py-[1.11vw] bg-[#FAFBFC] border-b border-[#E5E7EB]">
            <div className="label uppercase text-[#6B7280]">RESEARCHER</div>
            <div className="label uppercase text-[#6B7280]">RESEARCH TOPIC</div>
            <div className="label uppercase text-[#6B7280]">STATUS</div>
            <div className="label uppercase text-[#6B7280]">DATE SUBMITTED</div>
            <div className="label uppercase text-[#6B7280]">ACTIONS</div>
          </div>

          {/* Table Rows */}
          {submissions.length === 0 ? (
            <div className="px-[1.67vw] py-[2.5vw] text-center body text-[#6B7280]">
              No submissions yet. Submit your first research lead!
            </div>
          ) : (
            submissions.map((submission) => {
              const status = statusConfig[submission.status as keyof typeof statusConfig]
              return (
                <div key={submission.id} className="grid grid-cols-[2fr_3fr_2fr_1.5fr_1fr] gap-[1.67vw] px-[1.67vw] py-[1.39vw] border-b border-[#E5E7EB] last:border-b-0">
                  <div className="body">{submission.researcherName || 'N/A'}</div>
                  <div className="body">{submission.researchTopic || 'Untitled'}</div>
                  <div>
                    <span 
                      className="inline-block px-[0.83vw] py-[0.28vw] rounded-full caption"
                      style={{ backgroundColor: status?.bg, color: status?.text }}
                    >
                      {status?.label || submission.status}
                    </span>
                  </div>
                  <div className="caption text-[#6B7280]">
                    {new Date(submission.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                  <Link href={`/dashboard/submissions/${submission.id}`} className="body text-[#0D7377] underline">
                    View
                  </Link>
                </div>
              )
            })
          )}
        </div>
      </section>
    </div>
  )
}
