import { requireAuth } from '@/lib/auth/session'
import { prisma } from '@/lib/database/prisma'
import { redirect } from 'next/navigation'
import { DashboardNavbar } from '@/components/dashboard-navbar'
import { SettingsTabs } from '@/components/settings/SettingsTabs'
import { AccountSettings } from '@/components/settings/AccountSettings'
import { ProfileSettings } from '@/components/settings/ProfileSettings'

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const session = await requireAuth()
  const params = await searchParams
  const activeTab = params.tab || 'account'
  
  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: {
      id: true,
      email: true,
      fullName: true,
      firstName: true,
      lastName: true,
      preferredName: true,
      role: true,
      bio: true,
      university: true,
      department: true,
      linkedinUrl: true,
      personalWebsite: true,
      profilePictureUrl: true,
      additionalLinks: true
    }
  })

  if (!user) redirect('/auth/signin')

  const isScout = user.role === 'SCOUT'
  const displayName = user.fullName || 'User'
  const initials = `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() || displayName.slice(0, 2).toUpperCase()

  return (
    <div className="h-screen bg-[#FAFBFC] flex flex-col">
      <DashboardNavbar 
        displayName={displayName}
        role={isScout ? 'Verified Scout' : 'Community Contributor'}
        initials={initials}
        profilePictureUrl={user.profilePictureUrl}
        activePage="submissions"
      />

      <div className="flex-1 overflow-hidden pt-[100px]">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-[120px] h-full flex flex-col">
          <h1 className="mb-[40px]">Settings</h1>
          
          <SettingsTabs activeTab={activeTab} />
          
          <div className="mt-[40px] flex-1 overflow-y-auto pb-[120px]">
            {activeTab === 'account' && <AccountSettings user={user} />}
            {activeTab === 'profile' && <ProfileSettings user={user} />}
          </div>
        </div>
      </div>
    </div>
  )
}
