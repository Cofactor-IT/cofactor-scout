'use server'

import { requireAuth } from '@/lib/auth/session'
import { prisma } from '@/lib/database/prisma'
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

export async function submitFeedback(data: {
  type: 'help' | 'bug' | 'feature' | 'comment'
  message: string
}) {
  const session = await requireAuth()
  
  if (!data.message || data.message.trim().length < 10) {
    return { success: false, error: 'Please provide at least 10 characters' }
  }
  
  try {
    const user = await prisma.user.findUnique({
      where: { id: session.id },
      select: { email: true, fullName: true }
    })
    
    if (!user) {
      return { success: false, error: 'User not found' }
    }
    
    const typeLabels = {
      help: 'Help Request',
      bug: 'Bug Report',
      feature: 'Feature Request',
      comment: 'General Comment'
    }
    
    const recipients = {
      help: ['team@cofactor.world'],
      bug: ['it@cofactor.world'],
      feature: ['nf@cofactor.world'],
      comment: ['team@cofactor.world', 'it@cofactor.world']
    }
    
    // Send to appropriate team
    if (isEmailConfigured()) {
      try {
        await transporter.sendMail({
          from: getFromAddress(),
          to: recipients[data.type],
          subject: `[Cofactor Scout] ${typeLabels[data.type]} from ${user.fullName}`,
          text: `${typeLabels[data.type]} from ${user.fullName} (${user.email}):\n\n${data.message}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #0D7377;">${typeLabels[data.type]}</h2>
              <p><strong>From:</strong> ${user.fullName} (${user.email})</p>
              <div style="background-color: #FAFBFC; padding: 20px; border-radius: 4px; margin: 20px 0;">
                <p style="white-space: pre-wrap;">${data.message}</p>
              </div>
            </div>
          `
        })
      } catch (err) {
        logger.error('Failed to send feedback to team', { error: err })
      }
      
      // Send confirmation to user
      try {
        await transporter.sendMail({
          from: getFromAddress(),
          to: user.email,
          subject: 'We received your feedback',
          text: `Hi ${user.fullName},\n\nThank you for your feedback! We've received your ${typeLabels[data.type].toLowerCase()} and will get back to you soon.\n\nBest,\nThe Cofactor Team`,
          html: `
            <div style="font-family: Arial, sans-serif; color: #1B2A4A; max-width: 600px; margin: 0 auto; background-color: #FAFBFC; padding: 40px 20px;">
              <div style="background-color: #ffffff; border-radius: 4px; padding: 40px; border: 1px solid #E5E7EB;">
                <h1 style="color: #0D7377; font-size: 28px; margin-bottom: 16px;">Feedback Received ✓</h1>
                <p style="color: #1B2A4A; font-size: 16px; line-height: 1.6; margin-bottom: 16px;">Hi ${user.fullName},</p>
                <p style="color: #1B2A4A; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">Thank you for your feedback! We've received your ${typeLabels[data.type].toLowerCase()} and will get back to you soon.</p>
                <p style="color: #1B2A4A; font-size: 16px; line-height: 1.6;">Best,<br>The Cofactor Team</p>
              </div>
            </div>
          `
        })
      } catch (err) {
        logger.error('Failed to send confirmation email', { error: err })
      }
    }
    
    return { success: true }
  } catch (error) {
    console.error('Submit feedback error:', error)
    return { success: false, error: 'Failed to submit feedback' }
  }
}
