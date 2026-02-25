import { requireAuth } from '@/lib/auth/session'
import { prisma } from '@/lib/database/prisma'
import { DashboardNavbar } from '@/components/dashboard-navbar'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { CommentForm } from '@/components/CommentForm'
import { CommentList } from '@/components/CommentList'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Submission | Cofactor Scout',
  description: 'View your research submission details and updates.'
}

export const dynamic = 'force-dynamic'

const statusConfig = {
  PENDING_RESEARCH: { label: 'Pending Research', bg: '#FEF3C7', text: '#92400E' },
  VALIDATING: { label: 'Validating', bg: '#DBEAFE', text: '#1E40AF' },
  MATCH_MADE: { label: 'Match Made', bg: '#D1FAE5', text: '#065F46' },
  PITCHED: { label: 'Pitched/Matchmaking', bg: '#E0E7FF', text: '#3730A3' },
}

export default async function SubmissionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireAuth()
  const { id } = await params
  
  console.log('=== SUBMISSION DETAIL DEBUG ===')
  console.log('Requested ID:', id)
  
  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: {
      fullName: true,
      firstName: true,
      lastName: true,
      role: true
    }
  })

  if (!user) redirect('/auth/signin')

  const submission = await prisma.researchSubmission.findFirst({
    where: {
      id: id,
      userId: session.id
    },
    include: {
      comments: {
        include: {
          user: {
            select: {
              fullName: true,
              firstName: true,
              lastName: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }
    }
  })

  console.log('Found submission:', submission?.id, submission?.researchTopic)
  console.log('=== END DEBUG ===')

  if (!submission) notFound()

  const isScout = user.role === 'SCOUT'
  const displayName = user.fullName || 'User'
  const initials = `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() || displayName.slice(0, 2).toUpperCase()

  const isDraft = submission.isDraft
  const status = statusConfig[submission.status as keyof typeof statusConfig]

  return (
    <div className="min-h-screen bg-[#FAFBFC]">
      <DashboardNavbar 
        displayName={displayName}
        role={isScout ? 'Verified Scout' : 'Community Contributor'}
        initials={initials}
        activePage={isDraft ? 'drafts' : 'submissions'}
      />

      {/* Page Header */}
      <div className="w-full border-b border-[#E5E7EB] bg-[#FAFBFC] mt-[70px]">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-[80px] py-[28px]">
          <Link 
            href={isDraft ? '/dashboard/drafts' : '/dashboard'} 
            className="inline-block mb-[24px] text-[14px] font-medium text-[#0D7377] underline hover:text-[#0A5A5D]"
          >
            ← Back to {isDraft ? 'My Drafts' : 'My Submissions'}
          </Link>
          
          <h1 className="text-[24px] md:text-[32px] lg:text-[36px] font-bold text-[#1B2A4A] tracking-[-0.005em] mb-[18px] max-w-[900px]">
            {submission.researchTopic || 'Untitled'}{isDraft && ' [DRAFT]'}
          </h1>
          
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-[16px]">
            <div className="flex items-center gap-[16px]">
              {!isDraft && status && (
                <span 
                  className="inline-block px-[12px] py-[4px] rounded-full text-[12px] font-medium"
                  style={{ backgroundColor: status.bg, color: status.text }}
                >
                  {status.label}
                </span>
              )}
              <span className="text-[14px] text-[#6B7280]">
                {isDraft ? 'Created' : 'Submitted'} {new Date(isDraft ? submission.createdAt : (submission.submittedAt || submission.createdAt)).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
            {isDraft && (
              <Link href={`/dashboard/submit?draft=${id}`} className="px-[16px] py-[6px] bg-[#0D7377] text-white rounded-full text-[14px] font-medium hover:bg-[#0A5A5D]">
                Continue Editing
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-[80px] py-[40px]">
        <div className="w-full max-w-[900px] mx-auto space-y-[40px]">
          
          {/* Researcher Information Card */}
          <div className="bg-white border border-[#E5E7EB] rounded-[4px] shadow-[0px_1px_3px_rgba(0,0,0,0.08)]">
            <div className="px-6 md:px-8 lg:px-[48px] py-[40px]">
              <h2 className="text-[20px] md:text-[24px] font-semibold text-[#1B2A4A] mb-[16px]">Researcher Information</h2>
              <div className="w-full h-[1px] bg-[#E5E7EB] mb-[20px]"></div>
              
              <div className="space-y-0">
                <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-[8px] md:gap-[16px] py-[14px] border-b border-[#E5E7EB]">
                  <span className="text-[12px] font-medium uppercase tracking-[0.005em] text-[#6B7280]">NAME</span>
                  <span className="text-[16px] font-serif text-[#1B2A4A] break-words">{submission.researcherName || 'Not provided'}</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-[8px] md:gap-[16px] py-[14px] border-b border-[#E5E7EB]">
                  <span className="text-[12px] font-medium uppercase tracking-[0.005em] text-[#6B7280]">EMAIL</span>
                  <span className="text-[16px] font-serif text-[#1B2A4A] break-all">{submission.researcherEmail || 'Not provided'}</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-[8px] md:gap-[16px] py-[14px] border-b border-[#E5E7EB]">
                  <span className="text-[12px] font-medium uppercase tracking-[0.005em] text-[#6B7280]">INSTITUTION</span>
                  <span className="text-[16px] font-serif text-[#1B2A4A] break-words">{submission.researcherInstitution || 'Not provided'}</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-[8px] md:gap-[16px] py-[14px] border-b border-[#E5E7EB]">
                  <span className="text-[12px] font-medium uppercase tracking-[0.005em] text-[#6B7280]">DEPARTMENT/LAB</span>
                  <span className="text-[16px] font-serif text-[#1B2A4A] break-words">{submission.researcherDepartment || 'Not provided'}</span>
                </div>
                
                {submission.researcherCareerStage && (
                  <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-[8px] md:gap-[16px] py-[14px] border-b border-[#E5E7EB]">
                    <span className="text-[12px] font-medium uppercase tracking-[0.005em] text-[#6B7280]">CAREER STAGE</span>
                    <span className="text-[16px] font-serif text-[#1B2A4A]">{submission.researcherCareerStage.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}</span>
                  </div>
                )}
                
                {submission.researcherLinkedin && (
                  <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-[8px] md:gap-[16px] py-[14px]">
                    <span className="text-[12px] font-medium uppercase tracking-[0.005em] text-[#6B7280]">LINKEDIN</span>
                    <a href={submission.researcherLinkedin} target="_blank" rel="noopener noreferrer" className="text-[16px] font-serif text-[#0D7377] underline hover:text-[#0A5A5D] break-all">
                      {submission.researcherLinkedin}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Research Details Card */}
          <div className="bg-white border border-[#E5E7EB] rounded-[4px] shadow-[0px_1px_3px_rgba(0,0,0,0.08)]">
            <div className="px-6 md:px-8 lg:px-[48px] py-[40px]">
              <h2 className="text-[20px] md:text-[24px] font-semibold text-[#1B2A4A] mb-[16px]">Research Details</h2>
              <div className="w-full h-[1px] bg-[#E5E7EB] mb-[20px]"></div>
              
              <div className="space-y-0">
                <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-[8px] md:gap-[16px] py-[14px] border-b border-[#E5E7EB]">
                  <span className="text-[12px] font-medium uppercase tracking-[0.005em] text-[#6B7280]">TOPIC</span>
                  <span className="text-[16px] font-serif text-[#1B2A4A] break-words">{submission.researchTopic || 'Not provided'}</span>
                </div>
                
                {submission.researchStage && (
                  <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-[8px] md:gap-[16px] py-[14px] border-b border-[#E5E7EB]">
                    <span className="text-[12px] font-medium uppercase tracking-[0.005em] text-[#6B7280]">RESEARCH STAGE</span>
                    <span className="text-[16px] font-serif text-[#1B2A4A]">{submission.researchStage.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}</span>
                  </div>
                )}
                
                {submission.fundingStatus && (
                  <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-[8px] md:gap-[16px] py-[14px] border-b border-[#E5E7EB]">
                    <span className="text-[12px] font-medium uppercase tracking-[0.005em] text-[#6B7280]">FUNDING STATUS</span>
                    <span className="text-[16px] font-serif text-[#1B2A4A]">{submission.fundingStatus.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}</span>
                  </div>
                )}
              </div>
              
              {submission.researchDescription && (
                <>
                  <div className="w-full h-[1px] bg-[#E5E7EB] mt-[20px] mb-[16px]"></div>
                  <div>
                    <span className="text-[12px] font-medium uppercase tracking-[0.005em] text-[#6B7280] block mb-[8px]">DESCRIPTION</span>
                    <p className="text-[16px] font-serif text-[#1B2A4A] leading-[1.7]">{submission.researchDescription}</p>
                  </div>
                </>
              )}
              
              {submission.keyPublications && (
                <>
                  <div className="w-full h-[1px] bg-[#E5E7EB] mt-[20px] mb-[16px]"></div>
                  <div>
                    <span className="text-[12px] font-medium uppercase tracking-[0.005em] text-[#6B7280] block mb-[8px]">KEY PUBLICATIONS</span>
                    <div className="text-[14px] font-serif text-[#0D7377] underline leading-[1.7] whitespace-pre-wrap">{submission.keyPublications}</div>
                  </div>
                </>
              )}
              
              {submission.potentialApplications && (
                <>
                  <div className="w-full h-[1px] bg-[#E5E7EB] mt-[20px] mb-[16px]"></div>
                  <div>
                    <span className="text-[12px] font-medium uppercase tracking-[0.005em] text-[#6B7280] block mb-[8px]">POTENTIAL APPLICATIONS</span>
                    <p className="text-[16px] font-serif text-[#1B2A4A] leading-[1.7]">{submission.potentialApplications}</p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Scout Pitch Card */}
          {submission.whyInteresting && (
            <div className="bg-white border border-[#E5E7EB] rounded-[4px] shadow-[0px_1px_3px_rgba(0,0,0,0.08)]">
              <div className="px-6 md:px-8 lg:px-[48px] py-[40px]">
                <h2 className="text-[20px] md:text-[24px] font-semibold text-[#1B2A4A] mb-[16px]">Scout Pitch</h2>
                <div className="w-full h-[1px] bg-[#E5E7EB] mb-[20px]"></div>
                
                <div>
                  <span className="text-[12px] font-medium uppercase tracking-[0.005em] text-[#6B7280] block mb-[8px]">WHY INTERESTING TO INVESTORS</span>
                  <p className="text-[16px] font-serif text-[#1B2A4A] leading-[1.7] mb-[20px]">{submission.whyInteresting}</p>
                </div>
                
                <div className="space-y-0">
                  {submission.submissionSource && (
                    <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-[8px] md:gap-[16px] py-[14px] border-t border-[#E5E7EB]">
                      <span className="text-[12px] font-medium uppercase tracking-[0.005em] text-[#6B7280]">SUBMISSION SOURCE</span>
                      <span className="text-[16px] font-serif text-[#1B2A4A]">{submission.submissionSource.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}</span>
                    </div>
                  )}
                  
                  {submission.relationshipToResearcher && (
                    <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-[8px] md:gap-[16px] py-[14px] border-t border-[#E5E7EB]">
                      <span className="text-[12px] font-medium uppercase tracking-[0.005em] text-[#6B7280]">RELATIONSHIP</span>
                      <span className="text-[16px] font-serif text-[#1B2A4A]">{submission.relationshipToResearcher.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}</span>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-[8px] md:gap-[16px] py-[14px] border-t border-[#E5E7EB]">
                    <span className="text-[12px] font-medium uppercase tracking-[0.005em] text-[#6B7280]">RESEARCHER AWARENESS</span>
                    <span className="text-[16px] font-serif text-[#2D7D46]">
                      {submission.researcherAwareness ? '✓ Researcher is aware of this submission' : 'Researcher is not aware'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Comments Card - Only for non-drafts */}
          {!isDraft && (
            <div className="bg-white border border-[#E5E7EB] rounded-[4px] shadow-[0px_1px_3px_rgba(0,0,0,0.08)]">
              <div className="px-6 md:px-8 lg:px-[48px] py-[40px]">
                <h2 className="text-[20px] md:text-[24px] font-semibold text-[#1B2A4A]">Updates & Comments</h2>
                <p className="text-[14px] font-serif text-[#6B7280] mt-[4px] mb-[20px]">Add additional information or corrections for the Cofactor team</p>
                <div className="w-full h-[1px] bg-[#E5E7EB] mb-[20px]"></div>
                
                {/* Compose Box */}
                <CommentForm submissionId={id} initials={initials} />
                
                <div className="clear-both"></div>
                
                {/* Comments List */}
                <div className="w-full h-[1px] bg-[#E5E7EB] my-[24px]"></div>
                <p className="text-[14px] font-medium text-[#6B7280] mb-[24px]">{submission.comments.length} Comments</p>
                
                <CommentList 
                  comments={submission.comments}
                  currentUserId={session.id}
                  submissionId={id}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
