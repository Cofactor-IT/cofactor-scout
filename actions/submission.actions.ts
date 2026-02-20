'use server'

import { prisma } from '@/lib/database/prisma'
import { requireAuth } from '@/lib/auth/session'
import { revalidatePath } from 'next/cache'
import nodemailer from 'nodemailer'
import { isEmailConfigured, getFromAddress } from '@/lib/email/utils'
import { logger } from '@/lib/logger'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export async function saveDraft(data: any) {
  const session = await requireAuth()
  
  try {
    // Clean data - convert empty strings to null for enum fields
    const { id, supportingLinks, ...restData } = data
    
    // Check for duplicate research topic
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
    
    const cleanData = {
      ...restData,
      researcherCareerStage: restData.researcherCareerStage && restData.researcherCareerStage !== '' ? restData.researcherCareerStage : null,
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

export async function submitResearch(data: any) {
  const session = await requireAuth()
  
  if (!data.id || typeof data.id !== 'string') {
    return { success: false, error: 'Invalid submission ID' }
  }
  
  try {
    // Verify ownership before updating
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
    
    const submission = await prisma.researchSubmission.update({
      where: { id: data.id },
      data: {
        isDraft: false,
        submittedAt: new Date(),
        status: 'PENDING_RESEARCH'
      }
    })
    
    // Update user stats
    await prisma.user.update({
      where: { id: session.id },
      data: {
        totalSubmissions: { increment: 1 },
        pendingSubmissions: { increment: 1 }
      }
    })
    
    // Send confirmation email
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
    
    revalidatePath('/dashboard')
    revalidatePath('/dashboard/drafts')
    return { success: true, id: submission.id }
  } catch (error) {
    console.error('Submit research error:', error)
    return { success: false, error: 'Failed to submit research' }
  }
}

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

export async function deleteDraft(id: string) {
  const session = await requireAuth()
  
  if (!id || typeof id !== 'string') {
    return { success: false, error: 'Invalid draft ID' }
  }
  
  try {
    // Verify ownership before deleting
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
