'use client'

import { useState } from 'react'
import { deleteComment } from '@/actions/comment.actions'

interface Comment {
  id: string
  content: string
  createdAt: Date
  userId: string
  user: {
    fullName: string
    firstName: string | null
    lastName: string | null
  }
}

interface CommentListProps {
  comments: Comment[]
  currentUserId: string
  submissionId: string
}

export function CommentList({ comments, currentUserId, submissionId }: CommentListProps) {
  const [deleting, setDeleting] = useState<string | null>(null)

  const handleDelete = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return
    
    setDeleting(commentId)
    await deleteComment(commentId, submissionId)
    setDeleting(null)
  }

  return (
    <div className="space-y-[24px]">
      {comments.map((comment, index) => (
        <div key={comment.id}>
          <div className="flex gap-[16px] items-start">
            <div className="w-[40px] h-[40px] rounded-full bg-[#1B2A4A] border-2 border-[#E5E7EB] flex items-center justify-center flex-shrink-0">
              <span className="text-[14px] font-bold text-white">
                {comment.user.firstName?.[0]}{comment.user.lastName?.[0]}
              </span>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-[8px]">
                <span className="text-[14px] font-semibold text-[#1B2A4A]">{comment.user.fullName}</span>
                <span className="text-[12px] text-[#6B7280]">
                  {new Date(comment.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
              <div className="bg-[#FAFBFC] border border-[#E5E7EB] rounded-[4px] px-[16px] py-[16px]">
                <p className="text-[14px] font-serif text-[#1B2A4A] leading-[1.7]">{comment.content}</p>
              </div>
              {comment.userId === currentUserId && (
                <div className="flex gap-[16px] mt-[8px]">
                  <button 
                    onClick={() => handleDelete(comment.id)}
                    disabled={deleting === comment.id}
                    className="text-[12px] text-[#EF4444] underline hover:text-[#DC2626] disabled:opacity-50"
                  >
                    {deleting === comment.id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              )}
            </div>
          </div>
          {index < comments.length - 1 && (
            <div className="w-full h-[1px] bg-[#E5E7EB] my-[24px]"></div>
          )}
        </div>
      ))}
    </div>
  )
}
