'use server'

import { prisma } from '@/lib/database/prisma'
import { requireAuth } from '@/lib/auth/session'
import { revalidatePath } from 'next/cache'
import { sendProfileUpdateEmail, sendAccountUpdateEmail } from '@/lib/email/send'
import { logger } from '@/lib/logger'
import bcrypt from 'bcryptjs'

export async function updateProfile(data: {
  bio: string
  university: string
  department: string
  linkedinUrl: string
  personalWebsite: string
  additionalLinks: { label: string; url: string }[]
  profilePictureUrl?: string | null
}) {
  const session = await requireAuth()
  
  // Validate URLs
  const urlFields = [
    { field: 'LinkedIn URL', value: data.linkedinUrl },
    { field: 'Personal Website', value: data.personalWebsite }
  ]
  
  for (const { field, value } of urlFields) {
    if (value && !isValidUrl(value)) {
      return { success: false, error: `${field} must be a valid URL (e.g., https://example.com)` }
    }
  }
  
  // Validate additional links
  for (const link of data.additionalLinks) {
    if (link.url && !isValidUrl(link.url)) {
      return { success: false, error: `${link.label || 'Link'} must be a valid URL` }
    }
  }
  
  try {
    const user = await prisma.user.update({
      where: { id: session.id },
      data: {
        bio: data.bio || null,
        university: data.university || null,
        department: data.department || null,
        linkedinUrl: data.linkedinUrl || null,
        personalWebsite: data.personalWebsite || null,
        additionalLinks: data.additionalLinks,
        ...(data.profilePictureUrl !== undefined && { profilePictureUrl: data.profilePictureUrl })
      },
      select: { email: true, fullName: true }
    })
    
    // Send confirmation email
    try {
      await sendProfileUpdateEmail(user.email, user.fullName)
    } catch (err) {
      logger.error('Failed to send profile update email', { userId: session.id, error: err })
    }
    
    revalidatePath('/settings')
    return { success: true }
  } catch (error) {
    console.error('Update profile error:', error)
    return { success: false, error: 'Failed to update profile' }
  }
}

export async function updateAccount(data: {
  firstName: string
  lastName: string
  preferredName: string
}) {
  const session = await requireAuth()
  
  if (!data.firstName || !data.lastName) {
    return { success: false, error: 'First and last name are required' }
  }
  
  try {
    const fullName = `${data.firstName} ${data.lastName}`.trim()
    
    const user = await prisma.user.update({
      where: { id: session.id },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        preferredName: data.preferredName || null,
        fullName
      },
      select: { email: true, fullName: true }
    })
    
    // Send confirmation email
    const changes = `Name updated to ${fullName}${data.preferredName ? `, preferred name: ${data.preferredName}` : ''}`
    try {
      await sendAccountUpdateEmail(user.email, user.fullName, changes)
    } catch (err) {
      logger.error('Failed to send account update email', { userId: session.id, error: err })
    }
    
    revalidatePath('/settings')
    revalidatePath('/dashboard')
    revalidatePath('/dashboard/drafts')
    return { success: true }
  } catch (error) {
    console.error('Update account error:', error)
    return { success: false, error: 'Failed to update account' }
  }
}

function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

export async function changePassword(data: {
  currentPassword: string
  newPassword: string
}) {
  const session = await requireAuth()
  
  if (!data.currentPassword || !data.newPassword) {
    return { success: false, error: 'All fields are required' }
  }
  
  if (data.newPassword.length < 8) {
    return { success: false, error: 'New password must be at least 8 characters' }
  }
  
  try {
    const user = await prisma.user.findUnique({
      where: { id: session.id },
      select: { password: true, email: true, fullName: true }
    })
    
    if (!user) {
      return { success: false, error: 'User not found' }
    }
    
    const isValid = await bcrypt.compare(data.currentPassword, user.password)
    if (!isValid) {
      return { success: false, error: 'Current password is incorrect' }
    }
    
    const hashedPassword = await bcrypt.hash(data.newPassword, 10)
    
    await prisma.user.update({
      where: { id: session.id },
      data: { password: hashedPassword }
    })
    
    try {
      await sendAccountUpdateEmail(user.email, user.fullName, 'Password changed')
    } catch (err) {
      logger.error('Failed to send password change email', { userId: session.id, error: err })
    }
    
    revalidatePath('/settings')
    return { success: true }
  } catch (error) {
    console.error('Change password error:', error)
    return { success: false, error: 'Failed to change password' }
  }
}
