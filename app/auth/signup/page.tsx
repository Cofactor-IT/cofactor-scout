'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import { AuthNavbar } from '@/components/ui/auth-navbar'
import { useRouter } from 'next/navigation'
import { CookieConsentTrigger } from '@/components/cookie-consent/Trigger'
import { SignUpForm } from './SignUpForm'

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-[#FAFBFC] pt-[78px]">
      <AuthNavbar />

      <div className="flex items-center justify-center min-h-[calc(100vh-158px)] px-4 py-4 pb-16">
        <Suspense fallback={
          <div className="w-full max-w-[500px] bg-white rounded-[4px] border border-[#E5E7EB] shadow-sm p-6 md:p-[48px]">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-[#E5E7EB] rounded w-3/4"></div>
              <div className="h-4 bg-[#E5E7EB] rounded w-1/2"></div>
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

            {/* University (Optional) */}
            <div>
              <label className="block text-[13px] font-medium text-[#1B2A4A] mb-[6px]" style={{ fontFamily: 'var(--font-rethink-sans)' }}>
                University/Institute <span className="text-[#6B7280] font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                name="universityName"
                placeholder="e.g., Stanford University"
                className="w-full h-[42px] px-[14px] bg-white border-2 border-[#E5E7EB] rounded-[4px] text-[14px] text-[#1B2A4A] placeholder:text-[#6B7280] focus:outline-none focus:border-[#0D7377]"
                style={{ fontFamily: 'var(--font-merriweather)' }}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full h-[48px] bg-[#0D7377] text-white rounded-full flex items-center justify-center gap-[8px] text-[15px] font-medium hover:bg-[#0a5a5d] shadow-md transition-colors"
              style={{ fontFamily: 'var(--font-rethink-sans)' }}
            >
              <Plus size={18} />
              Create Account
            </button>

            {/* Scout Link */}
            <p className="text-center text-[13px] text-[#6B7280]" style={{ fontFamily: 'var(--font-merriweather)' }}>
              Ready to join our talent network?{' '}
              <Link href="/auth/signup?path=apply" className="text-[#0D7377] underline hover:text-[#0a5a5d]">
                Sign up as a scout
              </Link>
            </p>
          </form>
        </div>
      </div>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 w-full h-[80px] bg-white border-t border-[#E5E7EB] flex items-center justify-center z-10 px-4 gap-6">
        <p className="body-small text-[#6B7280] text-center max-w-[600px]">
          By continuing, you agree to Cofactor's Terms of Service and Privacy Policy.
          Use of the platform constitutes acceptance of these agreements.
        </p>
        <div className="text-[#E5E7EB] hidden md:block">|</div>
        <div className="hidden md:block">
          <CookieConsentTrigger />
        </div>
      </footer>
    </div>
  )
}
