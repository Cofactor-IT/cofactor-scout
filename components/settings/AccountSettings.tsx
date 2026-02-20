'use client'

import { useState } from 'react'
import { CheckCircle, X } from 'lucide-react'
import { FormInput } from '@/components/submission/FormInput'
import { PasswordInput } from '@/components/ui/password-input'
import { Modal } from '@/components/ui/modal'
import { updateAccount, changePassword } from '@/actions/settings.actions'

interface AccountSettingsProps {
  user: {
    email: string
    fullName: string
    firstName: string | null
    lastName: string | null
    preferredName: string | null
  }
}

export function AccountSettings({ user }: AccountSettingsProps) {
  const [formData, setFormData] = useState({
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    preferredName: user.preferredName || '',
    email: user.email
  })
  
  const [showSuccess, setShowSuccess] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState(false)

  const handlePasswordChange = async () => {
    setPasswordError('')
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('Passwords do not match')
      return
    }
    
    setShowPasswordModal(false)
    setLoading(true)
    const result = await changePassword({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword
    })
    
    if (result.success) {
      setPasswordSuccess(true)
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setTimeout(() => setPasswordSuccess(false), 5000)
    } else if (result.error) {
      setPasswordError(result.error)
    }
    setLoading(false)
  }

  const handleSave = async () => {
    setShowModal(false)
    setLoading(true)
    setError('')
    setShowSuccess(false)
    const result = await updateAccount(formData)
    if (result.success) {
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 5000)
    } else if (result.error) {
      setError(result.error)
    }
    setLoading(false)
  }

  return (
    <div className="w-full max-w-[900px] bg-white border border-[#E5E7EB] rounded-[4px] shadow-sm p-6 md:p-8 lg:p-[48px]">
      {passwordSuccess && (
        <div className="mb-[24px] p-[12px] bg-[#D1FAE5] border border-[#2D7D46] rounded-[4px] flex items-center gap-[8px]">
          <CheckCircle className="w-[16px] h-[16px] text-[#2D7D46]" />
          <span className="text-[14px] text-[#2D7D46]">Password changed successfully!</span>
        </div>
      )}
      
      {showSuccess && (
        <div className="mb-[24px] p-[12px] bg-[#D1FAE5] border border-[#2D7D46] rounded-[4px] flex items-center gap-[8px]">
          <CheckCircle className="w-[16px] h-[16px] text-[#2D7D46]" />
          <span className="text-[14px] text-[#2D7D46]">Account updated! Confirmation email sent.</span>
        </div>
      )}
      
      {passwordError && (
        <div className="mb-[24px] p-[12px] bg-[#FEE2E2] border border-[#EF4444] rounded-[4px] flex items-center gap-[8px]">
          <X className="w-[16px] h-[16px] text-[#EF4444]" />
          <span className="text-[14px] text-[#EF4444]">{passwordError}</span>
        </div>
      )}
      
      {error && (
        <div className="mb-[24px] p-[12px] bg-[#FEE2E2] border border-[#EF4444] rounded-[4px] text-[#EF4444] text-[14px]">
          {error}
        </div>
      )}

      <h2 className="text-[24px] font-semibold text-[#1B2A4A] mb-[8px]">Personal Information</h2>
      <p className="text-[14px] font-serif text-[#6B7280] mb-[32px]">
        Update your personal details
      </p>

      <div className="flex flex-col gap-[24px]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-[24px] md:gap-[32px]">
          <FormInput
            label="First Name"
            name="firstName"
            value={formData.firstName}
            onChange={(value) => setFormData({ ...formData, firstName: value })}
            required
          />
          <FormInput
            label="Last Name"
            name="lastName"
            value={formData.lastName}
            onChange={(value) => setFormData({ ...formData, lastName: value })}
            required
          />
        </div>

        <FormInput
          label="Preferred Name"
          name="preferredName"
          value={formData.preferredName}
          onChange={(value) => setFormData({ ...formData, preferredName: value })}
          helperText="Optional - How you'd like to be addressed"
        />

        <FormInput
          label="Email"
          name="email"
          value={formData.email}
          onChange={() => {}}
          type="email"
          helperText="Contact support to change your email"
        />
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
        <p className="body">Are you sure you want to save these changes to your account?</p>
      </Modal>

      <div className="h-[1px] bg-[#E5E7EB] my-[40px]" />

      <h2 className="text-[24px] font-semibold text-[#1B2A4A] mb-[32px]">Password</h2>
      <button 
        onClick={() => setShowPasswordModal(true)}
        disabled={loading}
        className="px-[24px] py-[12px] bg-[#0D7377] text-white text-[14px] font-medium rounded-full hover:bg-[#0A5A5D] disabled:opacity-50"
      >
        Change Password
      </button>
      
      <Modal
        isOpen={showPasswordModal}
        onClose={() => {
          setShowPasswordModal(false)
          setPasswordError('')
        }}
        title="Change Password"
        size="sm"
        footer={
          <>
            <button
              onClick={() => {
                setShowPasswordModal(false)
                setPasswordError('')
              }}
              className="px-[24px] py-[12px] border-2 border-[#E5E7EB] text-[#1B2A4A] text-[14px] font-medium rounded-full hover:bg-[#FAFBFC]"
            >
              Cancel
            </button>
            <button
              onClick={handlePasswordChange}
              disabled={!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
              className="px-[24px] py-[12px] bg-[#0D7377] text-white text-[14px] font-medium rounded-full hover:bg-[#0A5A5D] disabled:opacity-50"
            >
              Change Password
            </button>
          </>
        }
      >
        <div className="flex flex-col gap-[24px]">
          <PasswordInput
            label="Current Password"
            name="currentPassword"
            value={passwordData.currentPassword}
            onChange={(value) => setPasswordData({ ...passwordData, currentPassword: value })}
            required
          />
          <PasswordInput
            label="New Password"
            name="newPassword"
            value={passwordData.newPassword}
            onChange={(value) => setPasswordData({ ...passwordData, newPassword: value })}
            helperText="At least 8 characters"
            showToggle
            required
          />
          <PasswordInput
            label="Confirm New Password"
            name="confirmPassword"
            value={passwordData.confirmPassword}
            onChange={(value) => setPasswordData({ ...passwordData, confirmPassword: value })}
            showToggle
            required
          />
        </div>
      </Modal>
    </div>
  )
}
