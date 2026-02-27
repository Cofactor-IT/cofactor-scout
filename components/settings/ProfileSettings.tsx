/**
 * ProfileSettings.tsx
 * 
 * Profile settings component for managing public profile information.
 * 
 * Features:
 * - Upload/remove profile picture with image compression
 * - Edit bio, university, department
 * - Manage LinkedIn and personal website URLs
 * - Add/remove additional social links
 * - Confirmation modal for changes
 */

'use client'

import { useState } from 'react'
import { Upload, CheckCircle, X } from 'lucide-react'
import { FormInput } from '@/components/submission/FormInput'
import { FormTextarea } from '@/components/submission/FormTextarea'
import { Modal } from '@/components/ui/modal'
import { updateProfile } from '@/actions/settings.actions'
import { compressImage } from '@/lib/image-upload'

/**
 * Props for ProfileSettings component.
 */
interface ProfileSettingsProps {
  user: {
    fullName: string
    firstName: string | null
    lastName: string | null
    bio: string | null
    university: string | null
    department: string | null
    linkedinUrl: string | null
    personalWebsite: string | null
    profilePictureUrl: string | null
    additionalLinks: any
  }
}

/**
 * Profile settings component with image upload and social links.
 * Client component with local state for form data and image processing.
 */
export function ProfileSettings({ user }: ProfileSettingsProps) {
  const [formData, setFormData] = useState({
    bio: user.bio || '',
    university: user.university || '',
    department: user.department || '',
    linkedinUrl: user.linkedinUrl || '',
    personalWebsite: user.personalWebsite || '',
    additionalLinks: Array.isArray(user.additionalLinks) ? user.additionalLinks : [],
    profilePictureUrl: user.profilePictureUrl || null
  })
  
  const [showSuccess, setShowSuccess] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [uploadError, setUploadError] = useState('')

  // Generate initials for avatar fallback
  const initials = `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() || user.fullName.slice(0, 2).toUpperCase()

  /**
   * Handles profile picture upload with compression.
   * Validates file type and size before processing.
   */
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    setUploadError('')
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadError('Please upload an image file')
      return
    }
    
    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('Image must be less than 10MB')
      return
    }
    
    try {
      setLoading(true)
      // Compress image to 200x200 for profile picture
      const compressed = await compressImage(file, 200)
      setFormData({ ...formData, profilePictureUrl: compressed })
      setLoading(false)
    } catch (error) {
      setUploadError('Failed to process image')
      setLoading(false)
    }
  }

  /**
   * Removes profile picture, reverting to initials.
   */
  const handleRemoveImage = () => {
    setFormData({ ...formData, profilePictureUrl: null })
  }

  /**
   * Saves profile changes after modal confirmation.
   */
  const handleSave = async () => {
    setShowModal(false)
    setLoading(true)
    const result = await updateProfile(formData)
    if (result.success) {
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)
    }
    setLoading(false)
  }

  return (
    <div className="w-full max-w-[900px] bg-white border border-[#E5E7EB] rounded-[4px] shadow-sm p-6 md:p-8 lg:p-[48px]">
      {uploadError && (
        <div className="mb-[24px] p-[12px] bg-[#FEE2E2] border border-[#EF4444] rounded-[4px] flex items-center gap-[8px]">
          <X className="w-[16px] h-[16px] text-[#EF4444]" />
          <span className="text-[14px] text-[#EF4444]">{uploadError}</span>
        </div>
      )}

      {showSuccess && (
        <div className="mb-[24px] p-[12px] bg-[#D1FAE5] border border-[#2D7D46] rounded-[4px] flex items-center gap-[8px]">
          <CheckCircle className="w-[16px] h-[16px] text-[#2D7D46]" />
          <span className="text-[14px] text-[#2D7D46]">Profile updated! Confirmation email sent.</span>
        </div>
      )}

      <h2 className="text-[24px] font-semibold text-[#1B2A4A] mb-[8px]">Profile Picture</h2>
      <p className="text-[14px] font-serif text-[#6B7280] mb-[24px]">
        Upload a profile picture or use your initials
      </p>

      <div className="flex flex-col md:flex-row items-start md:items-center gap-[16px] md:gap-[24px] mb-[40px]">
        {formData.profilePictureUrl ? (
          <img 
            src={formData.profilePictureUrl} 
            alt={user.fullName}
            className="w-[80px] h-[80px] rounded-full object-cover border-2 border-[#E5E7EB]"
          />
        ) : (
          <div className="w-[80px] h-[80px] rounded-full bg-[#1B2A4A] border-2 border-[#E5E7EB] flex items-center justify-center">
            <span className="text-[24px] text-white font-bold">{initials}</span>
          </div>
        )}
        
        <div className="flex gap-[12px]">
          <label className="px-[24px] py-[12px] bg-[#0D7377] text-white text-[14px] font-medium rounded-full hover:bg-[#0A5A5D] cursor-pointer flex items-center gap-[8px]">
            <Upload className="w-[16px] h-[16px]" />
            {loading ? 'Processing...' : 'Upload Photo'}
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleImageUpload}
              disabled={loading}
              className="hidden" 
            />
          </label>
          {formData.profilePictureUrl && (
            <button 
              onClick={handleRemoveImage}
              disabled={loading}
              className="px-[24px] py-[12px] border-2 border-[#E5E7EB] text-[#1B2A4A] text-[14px] font-medium rounded-full hover:bg-[#FAFBFC] disabled:opacity-50"
            >
              Remove
            </button>
          )}
        </div>
      </div>

      <div className="h-[1px] bg-[#E5E7EB] mb-[32px]" />

      <div className="flex flex-col gap-[24px]">
        <FormTextarea
          label="Bio"
          name="bio"
          value={formData.bio}
          onChange={(value) => setFormData({ ...formData, bio: value })}
          helperText="Tell us about yourself"
          placeholder="I'm a researcher working on..."
          rows={4}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-[24px] md:gap-[32px]">
          <FormInput
            label="University"
            name="university"
            value={formData.university}
            onChange={(value) => setFormData({ ...formData, university: value })}
          />
          <FormInput
            label="Department"
            name="department"
            value={formData.department}
            onChange={(value) => setFormData({ ...formData, department: value })}
          />
        </div>

        <FormInput
          label="LinkedIn URL"
          name="linkedinUrl"
          value={formData.linkedinUrl}
          onChange={(value) => setFormData({ ...formData, linkedinUrl: value })}
          placeholder="https://linkedin.com/in/..."
        />

        <FormInput
          label="Personal Website"
          name="personalWebsite"
          value={formData.personalWebsite}
          onChange={(value) => setFormData({ ...formData, personalWebsite: value })}
          placeholder="https://..."
        />

        <div>
          <label className="block text-[14px] font-medium text-[#1B2A4A] mb-[8px]">
            Additional Links
            <span className="text-[12px] text-[#6B7280] font-normal ml-[8px]">
              (GitHub, Twitter, Portfolio, etc.)
            </span>
          </label>
          <div className="space-y-[12px]">
            {formData.additionalLinks.map((link: any, index: number) => (
              <div key={index} className="flex gap-[12px]">
                <input
                  type="text"
                  placeholder="Label (e.g., GitHub)"
                  value={link.label || ''}
                  onChange={(e) => {
                    const newLinks = [...formData.additionalLinks]
                    newLinks[index] = { ...newLinks[index], label: e.target.value }
                    setFormData({ ...formData, additionalLinks: newLinks })
                  }}
                  className="flex-1 h-[48px] px-[16px] border-2 border-[#E5E7EB] rounded-[4px] text-[14px] font-serif focus:outline-none focus:border-[#0D7377]"
                />
                <input
                  type="url"
                  placeholder="URL"
                  value={link.url || ''}
                  onChange={(e) => {
                    const newLinks = [...formData.additionalLinks]
                    newLinks[index] = { ...newLinks[index], url: e.target.value }
                    setFormData({ ...formData, additionalLinks: newLinks })
                  }}
                  className="flex-[2] h-[48px] px-[16px] border-2 border-[#E5E7EB] rounded-[4px] text-[14px] font-serif focus:outline-none focus:border-[#0D7377]"
                />
                <button
                  type="button"
                  onClick={() => {
                    const newLinks = formData.additionalLinks.filter((_: any, i: number) => i !== index)
                    setFormData({ ...formData, additionalLinks: newLinks })
                  }}
                  className="px-[16px] h-[48px] text-[#EF4444] hover:text-[#DC2626] text-[14px] font-medium"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => {
                setFormData({
                  ...formData,
                  additionalLinks: [...formData.additionalLinks, { label: '', url: '' }]
                })
              }}
              className="text-[14px] text-[#0D7377] hover:text-[#0A5A5D] font-medium"
            >
              + Add Link
            </button>
          </div>
        </div>
      </div>

      <div className="mt-[32px] flex justify-end">
        <button 
          onClick={() => setShowModal(true)}
          disabled={loading}
          className="px-[32px] py-[12px] bg-[#0D7377] text-white text-[14px] font-medium rounded-full hover:bg-[#0A5A5D] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Confirm Changes"
        size="sm"
        footer={
          <>
            <button
              onClick={() => setShowModal(false)}
              className="px-[24px] py-[12px] border-2 border-[#E5E7EB] text-[#1B2A4A] text-[14px] font-medium rounded-full hover:bg-[#FAFBFC]"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-[24px] py-[12px] bg-[#0D7377] text-white text-[14px] font-medium rounded-full hover:bg-[#0A5A5D]"
            >
              Confirm
            </button>
          </>
        }
      >
        <p className="body">Are you sure you want to save these changes to your profile?</p>
      </Modal>
    </div>
  )
}
