'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { FileText } from 'lucide-react'
import { SearchInput } from '@/components/ui/search-input'

interface Draft {
  id: string
  researchTopic: string | null
  researcherName: string | null
  updatedAt: Date
}

interface DraftsTableProps {
  drafts: Draft[]
  deleteDraft: (formData: FormData) => Promise<void>
  clearAllDrafts: () => Promise<void>
}

export function DraftsTable({ drafts, deleteDraft, clearAllDrafts }: DraftsTableProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredDrafts = useMemo(() => {
    if (!searchQuery) return drafts
    
    const query = searchQuery.toLowerCase()
    return drafts.filter(draft => 
      (draft.researchTopic?.toLowerCase().includes(query)) ||
      (draft.researcherName?.toLowerCase().includes(query))
    )
  }, [drafts, searchQuery])

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-[24px] md:mb-[32px] gap-4">
        <h3>My Drafts</h3>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
          <SearchInput 
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search drafts..."
          />
          {drafts.length > 0 && (
            <form action={clearAllDrafts}>
              <button type="submit" className="text-[14px] text-[#EF4444] underline hover:text-[#DC2626] whitespace-nowrap">
                Clear All Drafts
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="border border-[#E5E7EB] rounded-[4px] overflow-x-auto">
        <div className="hidden md:grid grid-cols-[2fr_3fr_2fr_1.5fr] gap-[24px] px-[24px] py-[16px] bg-[#FAFBFC] border-b border-[#E5E7EB] min-w-[700px]">
          <div className="label uppercase text-[#6B7280]">RESEARCHER</div>
          <div className="label uppercase text-[#6B7280]">RESEARCH TOPIC</div>
          <div className="label uppercase text-[#6B7280]">LAST EDITED</div>
          <div className="label uppercase text-[#6B7280] text-right">ACTIONS</div>
        </div>

        {filteredDrafts.length === 0 ? (
          <div className="px-[24px] py-[48px] flex flex-col items-center justify-center text-center">
            <FileText className="w-[48px] h-[48px] text-[#E5E7EB] mb-[16px]" strokeWidth={1.5} />
            <p className="text-[14px] font-serif text-[#6B7280]">
              {searchQuery ? 'No drafts match your search.' : 'No drafts yet. Start a new submission to create a draft.'}
            </p>
          </div>
        ) : (
          filteredDrafts.map((draft) => {
            const draftId = draft.id
            return (
              <div key={draftId} data-draft-id={draftId} className="grid grid-cols-[2fr_3fr_2fr_1.5fr] gap-[24px] px-[24px] py-[20px] border-b border-[#E5E7EB] last:border-b-0">
                <div className="text-[14px] font-serif">{draft.researcherName || 'Not specified'}</div>
                <Link href={`/dashboard/submissions/${draftId}`} data-link-id={draftId} className="text-[14px] font-serif text-[#0D7377] hover:underline">
                  {draft.researchTopic || 'Untitled draft'}
                </Link>
                <div className="text-[14px] font-serif text-[#6B7280]">
                  {new Date(draft.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
                <div className="flex items-center justify-end gap-[12px]">
                  <Link href={`/dashboard/submit?draft=${draftId}`} data-continue-id={draftId} className="px-[16px] py-[6px] bg-[#0D7377] text-white rounded-full text-[14px] font-medium hover:bg-[#0A5A5D]">
                    Continue
                  </Link>
                  <form action={deleteDraft} className="inline">
                    <input type="hidden" name="id" value={draftId} />
                    <button type="submit" className="text-[14px] font-medium text-[#EF4444] hover:text-[#DC2626]">
                      Delete
                    </button>
                  </form>
                </div>
              </div>
            )
          })
        )}
      </div>
    </>
  )
}
