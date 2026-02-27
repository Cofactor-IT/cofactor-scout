/**
 * submission.actions.ts
 * 
 * Server Actions for research submission management including drafts,
 * submission, retrieval, and deletion.
 * 
 * All actions verify user authentication and ownership before operations.
 * Submissions go through draft -> submitted workflow with email notifications.
 */

'use server'

import { prisma } from '@/lib/database/prisma'
import { requireAuth } from '@/lib/auth/session'
import { revalidatePath } from 'next/cache'
import nodemailer from 'nodemailer'
import { isEmailConfigured, getFromAddress } from '@/lib/email/utils'
import { logger } from '@/lib/logger'

// ============================================
// EMAIL CONFIGURATION
// ============================================

// SMTP transporter for sending submission confirmation emails
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

// ============================================
// EXPORTED SERVER ACTIONS
// ============================================

/**
 * Saves or updates a research submission draft.
 * Validates for duplicate research topics before saving.
 * Cleans enum fields by converting empty strings to null.
 * 
 * @param data - Draft data including all submission fields
 * @param data.id - Draft ID for updates, 'new' for creation
 * @returns Success status and draft ID, or error message
 * @throws {Error} If user is not authenticated
 */
export async function saveDraft(data: any) {
  // Always read userId from session, never from client input
  const session = await requireAuth()
  
  try {
    // Clean data - convert empty strings to null for enum fields to prevent validation errors
    const { id, supportingLinks, ...restData } = data
    
    // Prevent duplicate submissions with same research topic
    if (restData.researchTopic) {
      const existingSubmission = await prisma.researchSubmission.findFirst({
        where: {
          userId: session.id,
          researchTopic: restData.researchTopic,
          NOT: id ? { id } : undefined
        }
      })
      
      if (existingSubmission) {
        return { success: false, error: 'A submission with this research topic already exists' }
      }
    }
    
    // Normalize enum fields - empty strings become null, OTHER values preserve custom text
    const cleanData = {
      ...restData,
      researcherCareerStage: restData.researcherCareerStage && restData.researcherCareerStage !== '' ? restData.researcherCareerStage : null,
      researcherCareerStageOther: restData.researcherCareerStage === 'OTHER' ? restData.researcherCareerStageOther : null,
      fundingStatus: restData.fundingStatus && restData.fundingStatus !== '' ? restData.fundingStatus : null,
      researchStage: restData.researchStage && restData.researchStage !== '' ? restData.researchStage : null,
      submissionSource: restData.submissionSource && restData.submissionSource !== '' ? restData.submissionSource : null,
      relationshipToResearcher: restData.relationshipToResearcher && restData.relationshipToResearcher !== '' ? restData.relationshipToResearcher : null,
      researcherLinkedin: restData.researcherLinkedin && restData.researcherLinkedin !== '' ? restData.researcherLinkedin : null,
      keyPublications: restData.keyPublications && restData.keyPublications !== '' ? restData.keyPublications : null,
      potentialApplications: restData.potentialApplications && restData.potentialApplications !== '' ? restData.potentialApplications : null,
      updatedAt: new Date()
    }
    
    let submission
    
    if (id && id !== 'new') {
      // Update existing draft
      submission = await prisma.researchSubmission.update({
        where: { id: id },
        data: cleanData
      })
    } else {
      // Create new draft
      submission = await prisma.researchSubmission.create({
        data: {
          userId: session.id,
          isDraft: true,
          ...cleanData
        }
      })
    }
    
    revalidatePath('/dashboard/drafts')
    return { success: true, id: submission.id }
  } catch (error) {
    console.error('Save draft error:', error)
    return { success: false, error: 'Failed to save draft' }
  }
}

/**
 * Converts a draft to a submitted research lead.
 * Updates user statistics and sends confirmation email.
 * Sets status to PENDING_RESEARCH for team review.
 * 
 * @param data - Submission data with draft ID
 * @param data.id - ID of draft to submit
 * @returns Success status and submission ID, or error message
 * @throws {Error} If user is not authenticated or draft not found
 */
export async function submitResearch(data: any) {
  const session = await requireAuth()
  
  if (!data.id || typeof data.id !== 'string') {
    return { success: false, error: 'Invalid submission ID' }
  }
  
  try {
    // Verify ownership and draft status before submitting
    const existingSubmission = await prisma.researchSubmission.findFirst({
      where: {
        id: data.id,
        userId: session.id,
        isDraft: true
      },
      select: { id: true }
    })
    
    if (!existingSubmission) {
      return { success: false, error: 'Draft not found or already submitted' }
    }
    
    // Mark draft as submitted and set initial status
    const submission = await prisma.researchSubmission.update({
      where: { id: data.id },
      data: {
        isDraft: false,
        submittedAt: new Date(),
        status: 'PENDING_RESEARCH'
      }
    })
    
    // Increment user submission counters
    await prisma.user.update({
      where: { id: session.id },
      data: {
        totalSubmissions: { increment: 1 },
        pendingSubmissions: { increment: 1 }
      }
    })
    
    // Send confirmation email if SMTP is configured
    if (isEmailConfigured()) {
      try {
        const user = await prisma.user.findUnique({
          where: { id: session.id },
          select: { email: true, fullName: true }
        })
        
        if (user) {
          await transporter.sendMail({
            from: getFromAddress(),
            to: user.email,
            subject: 'Research Lead Submitted Successfully',
            text: `Hi ${user.fullName},\n\nYour research lead has been submitted successfully and is now under review.\n\nWe'll notify you once it's been reviewed.\n\nBest,\nThe Cofactor Team`,
            html: `
              <div style="font-family: Arial, sans-serif; color: #1B2A4A; max-width: 600px; margin: 0 auto; background-color: #FAFBFC; padding: 40px 20px;">
                <div style="background-color: #ffffff; border-radius: 4px; padding: 40px; border: 1px solid #E5E7EB;">
                  <h1 style="color: #0D7377; font-size: 28px; margin-bottom: 16px;">Research Lead Submitted! ✓</h1>
                  <p style="color: #1B2A4A; font-size: 16px; line-height: 1.6; margin-bottom: 16px;">Hi ${user.fullName},</p>
                  <p style="color: #1B2A4A; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">Your research lead has been submitted successfully and is now under review. We'll notify you once it's been reviewed.</p>
                  <p style="color: #1B2A4A; font-size: 16px; line-height: 1.6;">Best,<br>The Cofactor Team</p>
                </div>
              </div>
            `
          })
        }
      } catch (err) {
        logger.error('Failed to send submission confirmation email', { userId: session.id, error: err })
      }
    }
    
    // Revalidate dashboard pages to show updated data
    revalidatePath('/dashboard')
    revalidatePath('/dashboard/drafts')
    return { success: true, id: submission.id }
  } catch (error) {
    console.error('Submit research error:', error)
    return { success: false, error: 'Failed to submit research' }
  }
}

/**
 * Retrieves a draft by ID for editing.
 * Verifies user owns the draft before returning.
 * 
 * @param id - Draft ID to retrieve
 * @returns Draft data or error message
 * @throws {Error} If user is not authenticated
 */
export async function getDraft(id: string) {
  const session = await requireAuth()
  
  try {
    const draft = await prisma.researchSubmission.findFirst({
      where: {
        id,
        userId: session.id,
        isDraft: true
      }
    })
    
    return { success: true, draft }
  } catch (error) {
    return { success: false, error: 'Failed to load draft' }
  }
}

/**
 * Deletes a draft submission.
 * Verifies user owns the draft before deletion.
 * 
 * @param id - Draft ID to delete
 * @returns Success status or error message
 * @throws {Error} If user is not authenticated or draft not found
 */
export async function deleteDraft(id: string) {
  const session = await requireAuth()
  
  if (!id || typeof id !== 'string') {
    return { success: false, error: 'Invalid draft ID' }
  }
  
  try {
    // Verify ownership and draft status before deleting
    const draft = await prisma.researchSubmission.findFirst({
      where: {
        id,
        userId: session.id,
        isDraft: true
      },
      select: { id: true }
    })
    
    if (!draft) {
      return { success: false, error: 'Draft not found or access denied' }
    }
    
    await prisma.researchSubmission.delete({
      where: { id }
    })
    
    revalidatePath('/dashboard/drafts')
    return { success: true }
  } catch (error) {
    console.error('Delete draft error:', error)
    return { success: false, error: 'Failed to delete draft' }
  }
}
