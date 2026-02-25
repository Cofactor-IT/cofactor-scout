import { requireAuth } from '@/lib/auth/session'
import { prisma } from '@/lib/database/prisma'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { FileText, Clock, CheckCircle, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DashboardNavbar } from '@/components/dashboard-navbar'
import { DraftsTable } from '@/components/DraftsTable'

export const dynamic = 'force-dynamic'

export default async function DraftsPage() {
    const session = await requireAuth()
    
    const user = await prisma.user.findUnique({
        where: { id: session.id },
        select: {
            id: true,
            fullName: true,
            firstName: true,
            lastName: true,
            role: true,
            totalSubmissions: true,
            pendingSubmissions: true,
            approvedSubmissions: true,
            profilePictureUrl: true
        }
    })

    if (!user) redirect('/auth/signin')

    const drafts = await prisma.researchSubmission.findMany({
        where: { userId: user.id, isDraft: true },
        orderBy: { updatedAt: 'desc' },
        select: {
            id: true,
            researchTopic: true,
            researcherName: true,
            updatedAt: true
        }
    })

    const draftCount = drafts.length
    const isScout = user.role === 'SCOUT'
    const displayName = user.fullName || 'User'
    const initials = `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() || displayName.slice(0, 2).toUpperCase()

    async function deleteDraft(formData: FormData) {
        'use server'
        const id = formData.get('id') as string
        await prisma.researchSubmission.delete({ where: { id } })
        redirect('/dashboard/drafts')
    }

    async function clearAllDrafts() {
        'use server'
        const session = await requireAuth()
        await prisma.researchSubmission.deleteMany({
            where: { userId: session.id, isDraft: true }
        })
        redirect('/dashboard/drafts')
    }

    return (
        <div className="h-screen bg-white flex flex-col overflow-hidden">
            <DashboardNavbar 
                displayName={displayName}
                role={isScout ? 'Verified Scout' : 'Community Contributor'}
                initials={initials}
                profilePictureUrl={user.profilePictureUrl}
                activePage="drafts"
            />

            {/* Page Header */}
            <section className="bg-[#FAFBFC] h-auto md:h-[150px] flex flex-col justify-center px-4 md:px-8 lg:px-[120px] mt-[70px] flex-shrink-0 py-6 md:py-0">
                <h2 className="mb-[12px]">My Drafts</h2>
                <p className="body text-[#6B7280]">Unfinished submissions you can continue working on</p>
            </section>

            {/* Statistics Cards */}
            <section className="bg-[#FAFBFC] h-auto md:h-[180px] flex items-center px-4 md:px-8 lg:px-[120px] flex-shrink-0 py-6 md:py-0">
                <div className="flex gap-[20px] md:gap-[40px] w-full overflow-x-auto md:overflow-x-visible pb-4 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0">
                    <Card className="min-w-[280px] md:min-w-0 md:w-full md:flex-1 h-[145px] flex flex-col justify-center px-[24px] shadow-sm flex-shrink-0">
                        <FileText className="w-[27px] h-[27px] mb-[10px] text-[#0D7377]" strokeWidth={1.5} />
                        <div className="text-[41px] font-bold mb-[3px] text-[#1B2A4A] font-sans">{draftCount}</div>
                        <div className="text-[14px] text-[#6B7280]">Drafts</div>
                    </Card>

                    <Card className="min-w-[280px] md:min-w-0 md:w-full md:flex-1 h-[145px] flex flex-col justify-center px-[24px] shadow-sm flex-shrink-0">
                        <Clock className="w-[27px] h-[27px] mb-[10px] text-[#F59E0B]" strokeWidth={1.5} />
                        <div className="text-[41px] font-bold mb-[3px] text-[#1B2A4A] font-sans">{user.pendingSubmissions}</div>
                        <div className="text-[14px] text-[#6B7280]">Pending Review</div>
                    </Card>

                    <Card className="min-w-[280px] md:min-w-0 md:w-full md:flex-1 h-[145px] flex flex-col justify-center px-[24px] shadow-sm flex-shrink-0">
                        <CheckCircle className="w-[27px] h-[27px] mb-[10px] text-[#2D7D46]" strokeWidth={1.5} />
                        <div className="text-[41px] font-bold mb-[3px] text-[#1B2A4A] font-sans">{user.approvedSubmissions}</div>
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

            {/* Drafts Table */}
            <section className="bg-white py-[40px] md:py-[60px] px-4 md:px-8 lg:px-[120px] pb-[80px] flex-1 overflow-y-auto">
                <DraftsTable 
                    drafts={drafts}
                    deleteDraft={deleteDraft}
                    clearAllDrafts={clearAllDrafts}
                />
            </section>
        </div>
    )
}
