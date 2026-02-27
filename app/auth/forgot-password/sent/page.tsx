/**
 * Password Reset Email Sent Page
 * 
 * Confirmation page shown after user requests password reset.
 * Instructs user to check email for reset link.
 */
import Link from 'next/link'
import { AuthNavbar } from '@/components/ui/auth-navbar'
import { Mail } from 'lucide-react'

export default function ForgotPasswordSentPage() {
  return (
    <div className="min-h-screen bg-[#FAFBFC]">
      <AuthNavbar />

      <div className="flex items-center justify-center min-h-[calc(100vh-158px)]">
        <div className="w-[500px] bg-white rounded-[4px] border border-[#E5E7EB] shadow-sm p-[48px] text-center">
          <div className="flex justify-center mb-[24px]">
            <div className="w-[64px] h-[64px] bg-[#D1FAE5] rounded-full flex items-center justify-center">
              <Mail size={32} className="text-[#0D7377]" />
            </div>
          </div>

          <h1 className="text-[36px] font-bold text-[#1B2A4A] mb-[12px]" style={{ fontFamily: 'var(--font-rethink-sans)', letterSpacing: '-0.18px' }}>
            Check Your Email
          </h1>
          <p className="text-[16px] text-[#6B7280] mb-[32px]" style={{ fontFamily: 'var(--font-merriweather)' }}>
            If an account exists with that email, we've sent you a password reset code. Check your inbox and follow the link to reset your password.
          </p>

          <Link
            href="/auth/signin"
            className="inline-block w-full h-[56px] bg-[#0D7377] text-white rounded-full flex items-center justify-center text-[18px] font-medium hover:bg-[#0a5a5d] shadow-md transition-colors"
            style={{ fontFamily: 'var(--font-rethink-sans)', boxShadow: '0px 2px 4px rgba(13,115,119,0.2)' }}
          >
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  )
}
