'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { FileText } from 'lucide-react'
import { SearchInput } from '@/components/ui/search-input'
import { Dropdown } from '@/components/ui/dropdown'

interface Submission {
  id: string
  researchTopic: string | null
  researcherName: string | null
  status: string
  createdAt: Date
}

interface SubmissionsTableProps {
  submissions: Submission[]
  statusConfig: Record<string, { label: string; bg: string; text: string }>
}

export function SubmissionsTable({ submissions, statusConfig }: SubmissionsTableProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const filteredSubmissions = useMemo(() => {
    let filtered = submissions

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(submission => 
        (submission.researchTopic?.toLowerCase().includes(query)) ||
        (submission.researcherName?.toLowerCase().includes(query))
      )
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(submission => {
        if (statusFilter === 'pending') {
          return submission.status === 'PENDING_RESEARCH' || submission.status === 'VALIDATING'
        }
        if (statusFilter === 'approved') {
          return submission.status === 'MATCH_MADE'
        }
        return true
      })
    }

    return filtered
  }, [submissions, searchQuery, statusFilter])

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-[24px] md:mb-[32px] gap-4">
        <h3>My Submissions</h3>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
          <SearchInput 
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search submissions..."
          />
          <Dropdown value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All Submissions</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
          </Dropdown>
        </div>
      </div>

      <div className="border border-[#E5E7EB] rounded-[4px] overflow-x-auto">
        <div className="hidden md:grid grid-cols-[2fr_3fr_2fr_1.5fr_1fr] gap-[24px] px-[24px] py-[16px] bg-[#FAFBFC] border-b border-[#E5E7EB] min-w-[800px]">
          <div className="label uppercase text-[#6B7280]">RESEARCHER</div>
          <div className="label uppercase text-[#6B7280]">RESEARCH TOPIC</div>
          <div className="label uppercase text-[#6B7280]">STATUS</div>
          <div className="label uppercase text-[#6B7280]">DATE SUBMITTED</div>
          <div className="label uppercase text-[#6B7280]">ACTIONS</div>
        </div>

        {filteredSubmissions.length === 0 ? (
          <div className="px-[24px] py-[48px] flex flex-col items-center justify-center text-center">
            <FileText className="w-[48px] h-[48px] text-[#E5E7EB] mb-[16px]" strokeWidth={1.5} />
            <p className="text-[14px] font-serif text-[#6B7280]">
              {searchQuery || statusFilter !== 'all' ? 'No submissions match your filters.' : 'No submissions yet. Submit your first research lead!'}
            </p>
          </div>
        ) : (
          filteredSubmissions.map((submission) => {
            const submissionId = submission.id
            const status = statusConfig[submission.status as keyof typeof statusConfig]
            return (
              <div key={submissionId} className="grid grid-cols-[2fr_3fr_2fr_1.5fr_1fr] gap-[24px] px-[24px] py-[20px] border-b border-[#E5E7EB] last:border-b-0">
                <div className="text-[14px] font-serif">{submission.researcherName || 'N/A'}</div>
                <Link href={`/dashboard/submissions/${submissionId}`} className="text-[14px] font-serif text-[#0D7377] hover:underline">
                  {submission.researchTopic || 'Untitled'}
                </Link>
                <div className="flex items-center">
                  <span 
                    className="inline-block px-[12px] py-[4px] rounded-full text-[14px] font-serif"
                    style={{ backgroundColor: status?.bg, color: status?.text }}
                  >
                    {status?.label || submission.status}
                  </span>
                </div>
                <div className="text-[14px] font-serif text-[#6B7280]">
                  {new Date(submission.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
                <Link href={`/dashboard/submissions/${submissionId}`} className="text-[14px] font-serif text-[#0D7377] underline">
                  View
                </Link>
              </div>
            )
          })
        )}
      </div>
    </>
  )
}
