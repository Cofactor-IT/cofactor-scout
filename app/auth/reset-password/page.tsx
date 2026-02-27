/**
 * Reset Password Page
 * 
 * Allows users to set new password using reset token from email.
 * Validates password strength and confirms password match.
 */
'use client'

import { useState, FormEvent, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Eye, EyeOff, Check, X } from 'lucide-react'
import { AuthNavbar } from '@/components/ui/auth-navbar'
import { resetPassword } from '@/actions/auth.actions'

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // Password strength requirements
  const requirements = [
    { label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
    { label: 'One uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
    { label: 'One lowercase letter', test: (p: string) => /[a-z]/.test(p) },
    { label: 'One number', test: (p: string) => /[0-9]/.test(p) },
    { label: 'One special character', test: (p: string) => /[^A-Za-z0-9]/.test(p) }
  ]

  const passwordsMatch = password && confirmPassword && password === confirmPassword

  useEffect(() => {
    if (!token) {
      router.push('/auth/forgot-password')
    }
  }, [token, router])

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)

    const formData = new FormData()
    formData.append('token', token || '')
    formData.append('password', password)

    const result = await resetPassword(undefined, formData)

    if (result.success) {
      router.push('/auth/signin?message=' + encodeURIComponent('Password reset successful! You can now sign in.'))
    } else if (result.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  if (!token) return null

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-158px)]">
      <div className="w-[500px] bg-white rounded-[4px] border border-[#E5E7EB] shadow-sm p-[48px]">
        <h1 className="text-[36px] font-bold text-[#1B2A4A] mb-[12px]" style={{ fontFamily: 'var(--font-rethink-sans)', letterSpacing: '-0.18px' }}>
          Set New Password
        </h1>
        <p className="text-[16px] text-[#6B7280] mb-[32px]" style={{ fontFamily: 'var(--font-merriweather)' }}>
          Enter your new password below
        </p>

        {error && (
          <div className="mb-[24px] p-[12px] bg-[#FEE2E2] border border-[#EF4444] rounded-[4px] text-[#EF4444] text-[14px]">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-[16px]">
          <div>
            <label className="block text-[14px] font-medium text-[#1B2A4A] mb-[8px]" style={{ fontFamily: 'var(--font-rethink-sans)' }}>
              New Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
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

            {password && (
              <div className="mt-[12px] space-y-[6px]">
                {requirements.map((req, i) => (
                  <div key={i} className="flex items-center gap-[8px] text-[14px]" style={{ fontFamily: 'var(--font-rethink-sans)' }}>
                    {req.test(password) ? (
                      <Check size={16} className="text-[#2D7D46]" />
                    ) : (
                      <X size={16} className="text-[#EF4444]" />
                    )}
                    <span className={req.test(password) ? 'text-[#2D7D46]' : 'text-[#6B7280]'}>
                      {req.label}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-[14px] font-medium text-[#1B2A4A] mb-[8px]" style={{ fontFamily: 'var(--font-rethink-sans)' }}>
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
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
              <div className="mt-[8px] flex items-center gap-[8px] text-[14px]" style={{ fontFamily: 'var(--font-rethink-sans)' }}>
                {passwordsMatch ? (
                  <>
                    <Check size={16} className="text-[#2D7D46]" />
                    <span className="text-[#2D7D46]">Passwords match</span>
                  </>
                ) : (
                  <>
                    <X size={16} className="text-[#EF4444]" />
                    <span className="text-[#EF4444]">Passwords do not match</span>
                  </>
                )}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-[56px] bg-[#0D7377] text-white rounded-full flex items-center justify-center text-[18px] font-medium hover:bg-[#0a5a5d] shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ fontFamily: 'var(--font-rethink-sans)', boxShadow: '0px 2px 4px rgba(13,115,119,0.2)' }}
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>

        <div className="mt-[24px] text-center">
          <Link href="/auth/signin" className="text-[14px] text-[#0D7377] underline hover:text-[#0a5a5d]" style={{ fontFamily: 'var(--font-rethink-sans)' }}>
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-[#FAFBFC]">
      <AuthNavbar />

      <Suspense fallback={
        <div className="flex items-center justify-center min-h-[calc(100vh-158px)]">
          <div className="w-[500px] bg-white rounded-[4px] border border-[#E5E7EB] shadow-sm p-[48px]">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-[#E5E7EB] rounded w-3/4"></div>
              <div className="h-4 bg-[#E5E7EB] rounded w-1/2"></div>
            </div>
          </div>
        </div>
      }>
        <ResetPasswordForm />
      </Suspense>
    </div>
  )
}
