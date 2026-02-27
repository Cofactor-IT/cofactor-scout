/**
 * Comment Form Component
 * 
 * Form for adding comments to research submissions.
 * Shows user avatar and handles comment submission.
 */
'use client'

import { useState } from 'react'
import { addComment } from '@/actions/comment.actions'

interface CommentFormProps {
  submissionId: string
  initials: string
}

export function CommentForm({ submissionId, initials }: CommentFormProps) {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!content.trim()) return
    
    setLoading(true)
    const result = await addComment(submissionId, content)
    if (result.success) {
      setContent('')
    }
    setLoading(false)
  }

  return (
    <div className="flex gap-[16px] items-start mb-[24px]">
      <div className="w-[40px] h-[40px] rounded-full bg-[#1B2A4A] border-2 border-[#E5E7EB] flex items-center justify-center flex-shrink-0">
        <span className="text-[14px] font-bold text-white">{initials}</span>
      </div>
      <div className="flex-1">
        <textarea 
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Add additional information or a correction..."
          className="w-full h-[96px] px-[16px] py-[12px] border-2 border-[#E5E7EB] rounded-[4px] text-[16px] font-serif text-[#1B2A4A] placeholder:text-[#6B7280] focus:outline-none focus:border-[#0D7377] resize-y"
          disabled={loading}
        />
        <button 
          onClick={handleSubmit}
          disabled={loading || !content.trim()}
          className="mt-[12px] px-[32px] py-[10px] bg-[#0D7377] text-white text-[14px] font-medium rounded-full shadow-[0px_2px_4px_rgba(13,115,119,0.2)] hover:bg-[#0A5A5D] float-right disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Posting...' : 'Post Comment'}
        </button>
      </div>
    </div>
  )
}
