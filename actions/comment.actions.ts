'use server'

import { prisma } from '@/lib/database/prisma'
import { requireAuth } from '@/lib/auth/session'
import { revalidatePath } from 'next/cache'
import DOMPurify from 'isomorphic-dompurify'

export async function addComment(submissionId: string, content: string) {
  const session = await requireAuth()
  
  // Validate inputs
  if (!submissionId || typeof submissionId !== 'string') {
    return { success: false, error: 'Invalid submission ID' }
  }
  
  if (!content || typeof content !== 'string') {
    return { success: false, error: 'Comment content is required' }
  }
  
  const trimmedContent = content.trim()
  
  if (trimmedContent.length === 0) {
    return { success: false, error: 'Comment cannot be empty' }
  }
  
  if (trimmedContent.length > 5000) {
    return { success: false, error: 'Comment is too long (max 5000 characters)' }
  }
  
  try {
    // Verify submission exists and user has access
    const submission = await prisma.researchSubmission.findFirst({
      where: {
        id: submissionId,
        userId: session.id
      },
      select: { id: true }
    })
    
    if (!submission) {
      return { success: false, error: 'Submission not found or access denied' }
    }
    
    // Sanitize content to prevent XSS
    const sanitizedContent = DOMPurify.sanitize(trimmedContent, {
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: []
    })
    
    await prisma.submissionComment.create({
      data: {
        submissionId,
        userId: session.id,
        content: sanitizedContent
      }
    })
    
    revalidatePath(`/dashboard/submissions/${submissionId}`)
    return { success: true }
  } catch (error) {
    console.error('Add comment error:', error)
    return { success: false, error: 'Failed to post comment' }
  }
}

export async function deleteComment(commentId: string, submissionId: string) {
  const session = await requireAuth()
  
  try {
    const comment = await prisma.submissionComment.findFirst({
      where: {
        id: commentId,
        userId: session.id
      }
    })
    
    if (!comment) {
      return { success: false, error: 'Comment not found or access denied' }
    }
    
    await prisma.submissionComment.delete({
      where: { id: commentId }
    })
    
    revalidatePath(`/dashboard/submissions/${submissionId}`)
    return { success: true }
  } catch (error) {
    console.error('Delete comment error:', error)
    return { success: false, error: 'Failed to delete comment' }
  }
}
