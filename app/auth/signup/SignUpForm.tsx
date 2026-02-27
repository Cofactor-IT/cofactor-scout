/**
 * SignUpForm.tsx
 * 
 * Sign up form component supporting two flows:
 * 1. Regular signup: Email, password, name, optional university
 * 2. Scout application signup: Pre-filled fields from scout application
 * 
 * Features:
 * - Real-time password validation with visual feedback
 * - Password confirmation matching
 * - Locked fields for scout applications
 * - Redirects to signin on success
 */

'use client'

import { useSearchParams } from 'next/navigation'
import { useActionState } from 'react'
import { signUp } from '@/actions/auth.actions'
import Link from 'next/link'
import { Eye, EyeOff, Plus, Check, X, Lock } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Sign up form component with password validation.
 * Handles both regular signup and scout application completion.
 */
export function SignUpForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [state, formAction] = useActionState(signUp, undefined)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  
  // Parse scout application data from URL query params
  const scoutAppData = searchParams.get('scoutApp')
  const scoutData = scoutAppData ? JSON.parse(decodeURIComponent(scoutAppData)) : null

  // Redirect to signin with success message after account creation
  useEffect(() => {
    if (state?.success) {
      router.push('/auth/signin?message=' + encodeURIComponent(state.success))
    }
  }, [state, router])

  // Password complexity requirements with real-time validation
  const requirements = [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'Contains uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'Contains lowercase letter', met: /[a-z]/.test(password) },
    { label: 'Contains number', met: /[0-9]/.test(password) },
    { label: 'Contains special character', met: /[^A-Za-z0-9]/.test(password) },
  ]

  return (
    <div className="w-full max-w-[500px] bg-white rounded-[4px] border border-[#E5E7EB] shadow-sm p-6 md:p-[48px] mb-16">
      {/* Header */}
      <h1 className="text-[32px] font-bold text-[#1B2A4A] mb-[8px]" style={{ fontFamily: 'var(--font-rethink-sans)' }}>
        {scoutData ? 'Complete Your Scout Application' : 'Create Your Account'}
      </h1>
      <p className="text-[14px] text-[#6B7280] mb-[24px]" style={{ fontFamily: 'var(--font-merriweather)' }}>
        {scoutData ? 'Set your password to complete your account' : 'Join Cofactor Scout to start submitting research leads'}
      </p>

      {/* Error/Success Messages */}
      {state?.error && (
        <div className="mb-[20px] p-[10px] bg-[#FEE2E2] border border-[#EF4444] rounded-[4px] text-[#EF4444] text-[13px]">
          {state.error}
        </div>
      )}

      {/* Form */}
      <form action={formAction} className="space-y-[20px]">
        {/* Hidden scout data fields */}
        {scoutData && (
          <>
            <input type="hidden" name="scoutApplication" value="true" />
            <input type="hidden" name="department" value={scoutData.department} />
            <input type="hidden" name="linkedinUrl" value={scoutData.linkedinUrl || ''} />
            <input type="hidden" name="userRole" value={scoutData.userRole} />
            <input type="hidden" name="userRoleOther" value={scoutData.userRoleOther || ''} />
            <input type="hidden" name="researchAreas" value={scoutData.researchAreas} />
            <input type="hidden" name="whyScout" value={scoutData.whyScout} />
            <input type="hidden" name="howSourceLeads" value={scoutData.howSourceLeads} />
          </>
        )}

        {/* Name */}
        <div>
          <label className="block text-[13px] font-medium text-[#1B2A4A] mb-[6px]" style={{ fontFamily: 'var(--font-rethink-sans)' }}>
            Name
          </label>
          <div className="relative">
            <input
              type="text"
              name="name"
              defaultValue={scoutData?.name || ''}
              readOnly={!!scoutData}
              placeholder="Enter your full name"
              required
              className={`w-full h-[42px] px-[14px] ${scoutData ? 'pr-[40px] bg-[#F9FAFB] cursor-not-allowed' : 'bg-white'} border-2 border-[#E5E7EB] rounded-[4px] text-[14px] ${scoutData ? 'text-[#6B7280]' : 'text-[#1B2A4A]'} placeholder:text-[#6B7280] focus:outline-none focus:border-[#0D7377]`}
              style={{ fontFamily: 'var(--font-merriweather)' }}
            />
            {scoutData && <Lock size={16} className="absolute right-[14px] top-1/2 -translate-y-1/2 text-[#6B7280]" />}
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-[13px] font-medium text-[#1B2A4A] mb-[6px]" style={{ fontFamily: 'var(--font-rethink-sans)' }}>
            Email
          </label>
          <div className="relative">
            <input
              type="email"
              name="email"
              defaultValue={scoutData?.email || ''}
              readOnly={!!scoutData}
              placeholder="you@university.edu"
              required
              className={`w-full h-[42px] px-[14px] ${scoutData ? 'pr-[40px] bg-[#F9FAFB] cursor-not-allowed' : 'bg-white'} border-2 border-[#E5E7EB] rounded-[4px] text-[14px] ${scoutData ? 'text-[#6B7280]' : 'text-[#1B2A4A]'} placeholder:text-[#6B7280] focus:outline-none focus:border-[#0D7377]`}
              style={{ fontFamily: 'var(--font-merriweather)' }}
            />
            {scoutData && <Lock size={16} className="absolute right-[14px] top-1/2 -translate-y-1/2 text-[#6B7280]" />}
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="block text-[13px] font-medium text-[#1B2A4A] mb-[6px]" style={{ fontFamily: 'var(--font-rethink-sans)' }}>
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 8 characters"
              required
              className="w-full h-[42px] px-[14px] pr-[42px] bg-white border-2 border-[#E5E7EB] rounded-[4px] text-[14px] text-[#1B2A4A] placeholder:text-[#6B7280] focus:outline-none focus:border-[#0D7377]"
              style={{ fontFamily: 'var(--font-merriweather)' }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-[14px] top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#1B2A4A]"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <div className="mt-[6px] space-y-[3px]">
            {requirements.map((req, index) => (
              <div key={index} className="flex items-center gap-[5px]">
                {req.met ? (
                  <Check size={12} className="text-[#2D7D46]" />
                ) : (
                  <X size={12} className="text-[#EF4444]" />
                )}
                <span 
                  className="text-[11px] italic transition-colors"
                  style={{ 
                    fontFamily: 'var(--font-merriweather)',
                    color: req.met ? '#2D7D46' : '#EF4444'
                  }}
                >
                  {req.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-[13px] font-medium text-[#1B2A4A] mb-[6px]" style={{ fontFamily: 'var(--font-rethink-sans)' }}>
            Confirm Password
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your password"
              required
              className="w-full h-[42px] px-[14px] pr-[42px] bg-white border-2 border-[#E5E7EB] rounded-[4px] text-[14px] text-[#1B2A4A] placeholder:text-[#6B7280] focus:outline-none focus:border-[#0D7377]"
              style={{ fontFamily: 'var(--font-merriweather)' }}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-[14px] top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#1B2A4A]"
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {confirmPassword && (
            <div className="mt-[6px] flex items-center gap-[5px]">
              {password === confirmPassword ? (
                <>
                  <Check size={12} className="text-[#2D7D46]" />
                  <span className="text-[11px] italic text-[#2D7D46]" style={{ fontFamily: 'var(--font-merriweather)' }}>
                    Passwords match
                  </span>
                </>
              ) : (
                <>
                  <X size={12} className="text-[#EF4444]" />
                  <span className="text-[11px] italic text-[#EF4444]" style={{ fontFamily: 'var(--font-merriweather)' }}>
                    Passwords do not match
                  </span>
                </>
              )}
            </div>
          )}
        </div>

        {/* University */}
        <div>
          <label className="block text-[13px] font-medium text-[#1B2A4A] mb-[6px]" style={{ fontFamily: 'var(--font-rethink-sans)' }}>
            University/Institute {!scoutData && <span className="text-[#6B7280] font-normal">(Optional)</span>}
          </label>
          <div className="relative">
            <input
              type="text"
              name="universityName"
              defaultValue={scoutData?.university || ''}
              readOnly={!!scoutData}
              placeholder="e.g., Stanford University"
              required={!!scoutData}
              className={`w-full h-[42px] px-[14px] ${scoutData ? 'pr-[40px] bg-[#F9FAFB] cursor-not-allowed' : 'bg-white'} border-2 border-[#E5E7EB] rounded-[4px] text-[14px] ${scoutData ? 'text-[#6B7280]' : 'text-[#1B2A4A]'} placeholder:text-[#6B7280] focus:outline-none focus:border-[#0D7377]`}
              style={{ fontFamily: 'var(--font-merriweather)' }}
            />
            {scoutData && <Lock size={16} className="absolute right-[14px] top-1/2 -translate-y-1/2 text-[#6B7280]" />}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full h-[48px] bg-[#0D7377] text-white rounded-full flex items-center justify-center gap-[8px] text-[15px] font-medium hover:bg-[#0a5a5d] shadow-md transition-colors"
          style={{ fontFamily: 'var(--font-rethink-sans)' }}
        >
          <Plus size={18} />
          {scoutData ? 'Complete Application' : 'Create Account'}
        </button>

        {/* Scout Link - only show if not from scout app */}
        {!scoutData && (
          <p className="text-center text-[13px] text-[#6B7280]" style={{ fontFamily: 'var(--font-merriweather)' }}>
            Ready to join our talent network?{' '}
            <Link href="/scout/apply" className="text-[#0D7377] underline hover:text-[#0a5a5d]">
              Apply as a scout
            </Link>
          </p>
        )}
      </form>
    </div>
  )
}
