/**
 * Comment Actions
 * 
 * Server actions for managing comments on research submissions.
 * Users can only comment on and delete their own submission comments.
 */
'use server'

import { prisma } from '@/lib/database/prisma'
import { requireAuth } from '@/lib/auth/session'
import { revalidatePath } from 'next/cache'
import DOMPurify from 'isomorphic-dompurify'

/**
 * Adds a comment to a research submission
 * 
 * @param submissionId - ID of the submission to comment on
 * @param content - Comment text (max 5000 characters)
 * @returns Success status or error message
 */
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
    
    // Strip all HTML tags to prevent XSS
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

/**
 * Deletes a comment from a submission
 * 
 * @param commentId - ID of the comment to delete
 * @param submissionId - ID of the parent submission (for cache revalidation)
 * @returns Success status or error message
 */
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
