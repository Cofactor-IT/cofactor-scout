'use client'

import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Mail } from 'lucide-react'
import { useState, FormEvent, Suspense } from 'react'
import { AuthNavbar } from '@/components/ui/auth-navbar'
import { resendVerificationEmail } from '@/actions/auth.actions'

function SignInForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [resendLoading, setResendLoading] = useState(false)
  const [resendSuccess, setResendSuccess] = useState('')
  const [resendCooldown, setResendCooldown] = useState(0)

  const message = searchParams.get('message')

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setResendSuccess('')
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const emailValue = formData.get('email') as string
    const password = formData.get('password') as string
    setEmail(emailValue)

    try {
      const result = await signIn('credentials', {
        email: emailValue,
        password,
        rememberMe: rememberMe.toString(),
        redirect: false,
      })

      if (result?.error) {
        if (result.error === 'CredentialsSignin') {
          setError('Invalid email or password. If you just signed up, please verify your email first.')
        } else {
          setError('Invalid email or password')
        }
        setLoading(false)
      } else {
        router.push('/dashboard')
        router.refresh()
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
      setLoading(false)
    }
  }

  async function handleResendVerification() {
    if (!email || resendCooldown > 0) return
    
    setResendLoading(true)
    setResendSuccess('')
    setError('')
    
    const formData = new FormData()
    formData.append('email', email)
    
    const result = await resendVerificationEmail(undefined, formData)
    
    if (result.success) {
      setResendSuccess(result.success)
      setResendCooldown(60)
      const interval = setInterval(() => {
        setResendCooldown(prev => {
          if (prev <= 1) {
            clearInterval(interval)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else if (result.error) {
      setError(result.error)
    }
    
    setResendLoading(false)
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-158px)] px-4 py-8">
      <div className="w-full max-w-[500px] bg-white rounded-[4px] border border-[#E5E7EB] shadow-sm p-6 md:p-[48px] my-8">
        {/* Header */}
        <h1 className="text-[32px] font-bold text-[#1B2A4A] mb-[8px]" style={{ fontFamily: 'var(--font-rethink-sans)', letterSpacing: '-0.18px' }}>
          Welcome Back
        </h1>
        <p className="text-[14px] text-[#6B7280] mb-[24px]" style={{ fontFamily: 'var(--font-merriweather)' }}>
          Sign in to continue to Cofactor Scout
        </p>

        {/* Success Message */}
        {message && (
          <div className="mb-[20px] p-[10px] bg-[#D1FAE5] border border-[#2D7D46] rounded-[4px] text-[#2D7D46] text-[13px]">
            {message}
          </div>
        )}

        {/* Resend Success Message */}
        {resendSuccess && (
          <div className="mb-[20px] p-[10px] bg-[#D1FAE5] border border-[#2D7D46] rounded-[4px] text-[#2D7D46] text-[13px]">
            {resendSuccess}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-[20px] p-[10px] bg-[#FEE2E2] border border-[#EF4444] rounded-[4px]">
            <p className="text-[#EF4444] text-[13px] mb-[6px]">{error}</p>
            {error.includes('verify your email') && email && (
              <button
                onClick={handleResendVerification}
                disabled={resendLoading || resendCooldown > 0}
                className="mt-[6px] flex items-center gap-[5px] text-[13px] text-[#0D7377] hover:text-[#0a5a5d] disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ fontFamily: 'var(--font-rethink-sans)' }}
              >
                <Mail size={13} />
                {resendLoading ? 'Sending...' : resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend verification email'}
              </button>
            )}
            {error === 'Invalid email or password' && (
              <p className="text-[13px] text-[#6B7280]" style={{ fontFamily: 'var(--font-merriweather)' }}>
                Don't have an account?{' '}
                <Link href="/auth/signup" className="text-[#0D7377] underline hover:text-[#0a5a5d]">
                  Sign up here
                </Link>
              </p>
            )}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-[16px]">
          {/* Email */}
          <div>
            <label className="block text-[13px] font-medium text-[#1B2A4A] mb-[6px]" style={{ fontFamily: 'var(--font-rethink-sans)' }}>
              Email
            </label>
            <input
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@university.edu"
              required
              className="w-full h-[42px] px-[14px] bg-white border-2 border-[#E5E7EB] rounded-[4px] text-[14px] text-[#1B2A4A] placeholder:text-[#6B7280] focus:outline-none focus:border-[#0D7377]"
              style={{ fontFamily: 'var(--font-merriweather)' }}
            />
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
                placeholder="Enter your password"
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
          </div>

          {/* Options Row */}
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-[6px] cursor-pointer group">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-[18px] h-[18px] border-2 border-[#E5E7EB] rounded-[4px] cursor-pointer"
              />
              <span className="text-[13px] text-[#1B2A4A]" style={{ fontFamily: 'var(--font-rethink-sans)' }}>
                Remember me for 30 days
              </span>
            </label>
            <Link href="/auth/forgot-password" className="text-[13px] text-[#0D7377] underline hover:text-[#0a5a5d]" style={{ fontFamily: 'var(--font-rethink-sans)' }}>
              Forgot password?
            </Link>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-[48px] bg-[#0D7377] text-white rounded-full flex items-center justify-center text-[15px] font-medium hover:bg-[#0a5a5d] shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ fontFamily: 'var(--font-rethink-sans)', boxShadow: '0px 2px 4px rgba(13,115,119,0.2)' }}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Signing in...</span>
              </div>
            ) : (
              'Sign In'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-[#FAFBFC] pt-[78px]">
      <AuthNavbar />

      <Suspense fallback={
        <div className="flex items-center justify-center min-h-[calc(100vh-158px)] px-4">
          <div className="w-full max-w-[500px] bg-white rounded-[4px] border border-[#E5E7EB] shadow-sm p-6 md:p-[48px] my-8">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-[#E5E7EB] rounded w-3/4"></div>
              <div className="h-4 bg-[#E5E7EB] rounded w-1/2"></div>
            </div>
          </div>
        </div>
      }>
        <SignInForm />
      </Suspense>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 w-full h-[80px] bg-white border-t border-[#E5E7EB] flex items-center justify-center z-40 px-4">
        <p className="text-[14px] md:text-[16px] text-[#6B7280] text-center" style={{ fontFamily: 'var(--font-merriweather)' }}>
          Don't have an account?{' '}
          <Link href="/auth/signup" className="text-[#0D7377] underline hover:text-[#0a5a5d]">
            Sign up
          </Link>
        </p>
      </footer>
    </div>
  )
}
