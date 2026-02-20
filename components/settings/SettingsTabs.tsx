'use client'

import Link from 'next/link'

interface SettingsTabsProps {
  activeTab: string
}

export function SettingsTabs({ activeTab }: SettingsTabsProps) {
  return (
    <div className="flex gap-[32px] border-b border-[#E5E7EB]">
      <Link
        href="/settings"
        className={`pb-[12px] text-[16px] font-medium border-b-2 transition-colors ${
          activeTab === 'account'
            ? 'border-[#0D7377] text-[#1B2A4A]'
            : 'border-transparent text-[#6B7280] hover:text-[#1B2A4A]'
        }`}
      >
        Account
      </Link>
      <Link
        href="/settings?tab=profile"
        className={`pb-[12px] text-[16px] font-medium border-b-2 transition-colors ${
          activeTab === 'profile'
            ? 'border-[#0D7377] text-[#1B2A4A]'
            : 'border-transparent text-[#6B7280] hover:text-[#1B2A4A]'
        }`}
      >
        Profile
      </Link>
    </div>
  )
}
