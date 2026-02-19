'use client'

import { useActionState } from 'react'
import { signUp } from '@/actions/auth.actions'
import Link from 'next/link'
import { Eye, EyeOff, Plus, Check, X } from 'lucide-react'
import { useState, useEffect } from 'react'
import { AuthNavbar } from '@/components/ui/auth-navbar'
import { useRouter } from 'next/navigation'

export default function SignUpPage() {
  const router = useRouter()
  const [state, formAction] = useActionState(signUp, undefined)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  useEffect(() => {
    if (state?.success) {
      router.push('/auth/signin?message=' + encodeURIComponent(state.success))
    }
  }, [state, router])

  const requirements = [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'Contains uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'Contains lowercase letter', met: /[a-z]/.test(password) },
    { label: 'Contains number', met: /[0-9]/.test(password) },
    { label: 'Contains special character', met: /[^A-Za-z0-9]/.test(password) },
  ]

  return (
    <div className="min-h-screen bg-[#FAFBFC]">
      <AuthNavbar />

      <div className="flex items-center justify-center min-h-[calc(100vh-158px)]">
        <div className="w-[500px] bg-white rounded-[4px] border border-[#E5E7EB] shadow-sm p-[48px]">
          {/* Header */}
          <h1 className="text-[36px] font-bold text-[#1B2A4A] mb-[12px]" style={{ fontFamily: 'var(--font-rethink-sans)' }}>
            Create Your Account
          </h1>
          <p className="text-[16px] text-[#6B7280] mb-[32px]" style={{ fontFamily: 'var(--font-merriweather)' }}>
            Join Cofactor Scout to start submitting research leads
          </p>

          {/* Error/Success Messages */}
          {state?.error && (
            <div className="mb-[24px] p-[12px] bg-[#FEE2E2] border border-[#EF4444] rounded-[4px] text-[#EF4444] text-[14px]">
              {state.error}
            </div>
          )}
          {state?.success && (
            <div className="mb-[24px] p-[12px] bg-[#D1FAE5] border border-[#2D7D46] rounded-[4px] text-[#2D7D46] text-[14px]">
              {state.success}
            </div>
          )}

          {/* Form */}
          <form action={formAction} className="space-y-[24px]">
            {/* Name */}
            <div>
              <label className="block text-[14px] font-medium text-[#1B2A4A] mb-[8px]" style={{ fontFamily: 'var(--font-rethink-sans)' }}>
                Name
              </label>
              <input
                type="text"
                name="name"
                placeholder="Enter your full name"
                required
                className="w-full h-[48px] px-[16px] bg-white border-2 border-[#E5E7EB] rounded-[4px] text-[16px] text-[#1B2A4A] placeholder:text-[#6B7280] focus:outline-none focus:border-[#0D7377]"
                style={{ fontFamily: 'var(--font-merriweather)' }}
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-[14px] font-medium text-[#1B2A4A] mb-[8px]" style={{ fontFamily: 'var(--font-rethink-sans)' }}>
                Email
              </label>
              <input
                type="email"
                name="email"
                placeholder="you@university.edu"
                required
                className="w-full h-[48px] px-[16px] bg-white border-2 border-[#E5E7EB] rounded-[4px] text-[16px] text-[#1B2A4A] placeholder:text-[#6B7280] focus:outline-none focus:border-[#0D7377]"
                style={{ fontFamily: 'var(--font-merriweather)' }}
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-[14px] font-medium text-[#1B2A4A] mb-[8px]" style={{ fontFamily: 'var(--font-rethink-sans)' }}>
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
                  className="w-full h-[48px] px-[16px] pr-[48px] bg-white border-2 border-[#E5E7EB] rounded-[4px] text-[16px] text-[#1B2A4A] placeholder:text-[#6B7280] focus:outline-none focus:border-[#0D7377]"
                  style={{ fontFamily: 'var(--font-merriweather)' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-[16px] top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#1B2A4A]"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <div className="mt-[8px] space-y-[4px]">
                {requirements.map((req, index) => (
                  <div key={index} className="flex items-center gap-[6px]">
                    {req.met ? (
                      <Check size={14} className="text-[#2D7D46]" />
                    ) : (
                      <X size={14} className="text-[#EF4444]" />
                    )}
                    <span 
                      className="text-[12px] italic transition-colors"
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
              <label className="block text-[14px] font-medium text-[#1B2A4A] mb-[8px]" style={{ fontFamily: 'var(--font-rethink-sans)' }}>
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
                  className="w-full h-[48px] px-[16px] pr-[48px] bg-white border-2 border-[#E5E7EB] rounded-[4px] text-[16px] text-[#1B2A4A] placeholder:text-[#6B7280] focus:outline-none focus:border-[#0D7377]"
                  style={{ fontFamily: 'var(--font-merriweather)' }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-[16px] top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#1B2A4A]"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {confirmPassword && (
                <div className="mt-[8px] flex items-center gap-[6px]">
                  {password === confirmPassword ? (
                    <>
                      <Check size={14} className="text-[#2D7D46]" />
                      <span className="text-[12px] italic text-[#2D7D46]" style={{ fontFamily: 'var(--font-merriweather)' }}>
                        Passwords match
                      </span>
                    </>
                  ) : (
                    <>
                      <X size={14} className="text-[#EF4444]" />
                      <span className="text-[12px] italic text-[#EF4444]" style={{ fontFamily: 'var(--font-merriweather)' }}>
                        Passwords do not match
                      </span>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* University (Optional) */}
            <div>
              <label className="block text-[14px] font-medium text-[#1B2A4A] mb-[8px]" style={{ fontFamily: 'var(--font-rethink-sans)' }}>
                University/Institute <span className="text-[#6B7280] font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                name="universityName"
                placeholder="e.g., Stanford University"
                className="w-full h-[48px] px-[16px] bg-white border-2 border-[#E5E7EB] rounded-[4px] text-[16px] text-[#1B2A4A] placeholder:text-[#6B7280] focus:outline-none focus:border-[#0D7377]"
                style={{ fontFamily: 'var(--font-merriweather)' }}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full h-[56px] bg-[#0D7377] text-white rounded-full flex items-center justify-center gap-[8px] text-[16px] font-medium hover:bg-[#0a5a5d] shadow-md transition-colors"
              style={{ fontFamily: 'var(--font-rethink-sans)' }}
            >
              <Plus size={20} />
              Create Account
            </button>

            {/* Scout Link */}
            <p className="text-center text-[14px] text-[#6B7280]" style={{ fontFamily: 'var(--font-merriweather)' }}>
              Ready to join our talent network?{' '}
              <Link href="/auth/signup?path=apply" className="text-[#0D7377] underline hover:text-[#0a5a5d]">
                Sign up as a scout
              </Link>
            </p>
          </form>
        </div>
      </div>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 w-full h-[80px] bg-white border-t border-[#E5E7EB] flex items-center justify-center z-10">
        <p className="text-[16px] text-[#6B7280]" style={{ fontFamily: 'var(--font-merriweather)' }}>
          Already have an account?{' '}
          <Link href="/auth/signin" className="text-[#0D7377] underline hover:text-[#0a5a5d]">
            Sign in
          </Link>
        </p>
      </footer>
    </div>
  )
}
