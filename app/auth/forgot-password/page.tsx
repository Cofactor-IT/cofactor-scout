'use client'

import { useState, FormEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AuthNavbar } from '@/components/ui/auth-navbar'
import { requestPasswordReset } from '@/actions/auth.actions'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const result = await requestPasswordReset(undefined, formData)

    if (result.success) {
      router.push('/auth/forgot-password/sent')
    } else if (result.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FAFBFC]">
      <AuthNavbar />

      <div className="flex items-center justify-center min-h-[calc(100vh-158px)]">
        <div className="w-[500px] bg-white rounded-[4px] border border-[#E5E7EB] shadow-sm p-[48px]">
          <h1 className="text-[36px] font-bold text-[#1B2A4A] mb-[12px]" style={{ fontFamily: 'var(--font-rethink-sans)', letterSpacing: '-0.18px' }}>
            Reset Password
          </h1>
          <p className="text-[16px] text-[#6B7280] mb-[32px]" style={{ fontFamily: 'var(--font-merriweather)' }}>
            Enter your email and we'll send you a reset code
          </p>

          {error && (
            <div className="mb-[24px] p-[12px] bg-[#FEE2E2] border border-[#EF4444] rounded-[4px] text-[#EF4444] text-[14px]">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-[16px]">
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

            <button
              type="submit"
              disabled={loading}
              className="w-full h-[56px] bg-[#0D7377] text-white rounded-full flex items-center justify-center text-[18px] font-medium hover:bg-[#0a5a5d] shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ fontFamily: 'var(--font-rethink-sans)', boxShadow: '0px 2px 4px rgba(13,115,119,0.2)' }}
            >
              {loading ? 'Sending...' : 'Send Reset Code'}
            </button>
          </form>

          <div className="mt-[24px] text-center">
            <Link href="/auth/signin" className="text-[14px] text-[#0D7377] underline hover:text-[#0a5a5d]" style={{ fontFamily: 'var(--font-rethink-sans)' }}>
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
