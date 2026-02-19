'use client'

interface Tab {
  key: string
  label: string
  badge?: number
}

interface TabsProps {
  tabs: Tab[]
  activeTab: string
  onTabChange: (key: string) => void
}

export function Tabs({ tabs, activeTab, onTabChange }: TabsProps) {
  return (
    <div className="flex gap-[0.56vw] border-b border-[#E5E7EB]">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onTabChange(tab.key)}
          className={`px-[1.11vw] py-[0.83vw] label transition-colors ${
            activeTab === tab.key
              ? 'text-[#0D7377] border-b-2 border-[#0D7377]'
              : 'text-[#6B7280] hover:text-[#1B2A4A]'
          }`}
        >
          {tab.label}
          {tab.badge !== undefined && (
            <span className="ml-[0.42vw] px-[0.56vw] py-[0.14vw] bg-[#E5E7EB] rounded-full caption text-[#1B2A4A]">
              {tab.badge}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}
