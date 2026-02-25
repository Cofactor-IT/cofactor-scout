'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import { AuthNavbar } from '@/components/ui/auth-navbar'
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
          </div>
        }>
          <SignUpForm />
        </Suspense>
      </div>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 w-full h-[80px] bg-white border-t border-[#E5E7EB] flex items-center justify-center z-40 px-4">
        <p className="text-[14px] md:text-[16px] text-[#6B7280] text-center" style={{ fontFamily: 'var(--font-merriweather)' }}>
          Already have an account?{' '}
          <Link href="/auth/signin" className="text-[#0D7377] underline hover:text-[#0a5a5d]">
            Sign in
          </Link>
        </p>
      </footer>
    </div>
  )
}
