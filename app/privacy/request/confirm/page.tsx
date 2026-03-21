/**
 * privacy/request/confirm/page.tsx
 *
 * Confirmation page for data subject rights requests.
 * Displays request ID, expected timeline, and contact information.
 */

import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import { FadeInOnLoad } from '@/components/ui/FadeInOnLoad'

export const metadata: Metadata = {
  title: 'Request Received | Cofactor Scout',
  description: 'Your data rights request has been received and is being processed.'
}

interface PageProps {
  searchParams: Promise<{ id?: string }>
}

/**
 * Confirmation page with request details.
 * Requires valid request ID in URL query parameter.
 */
export default async function PrivacyRequestConfirmPage({ searchParams }: PageProps) {
  const { id } = await searchParams

  if (!id) {
    redirect('/privacy/request')
  }

  return (
    <FadeInOnLoad delay={0.2}>
      <div className="px-4 md:px-8 lg:px-[120px] py-12 md:py-[80px]">
        <div className="max-w-[800px] mx-auto">

          <Card className="p-6 md:p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--green)] mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="mb-4">Request Received</h1>
              <p className="body-large text-[var(--cool-gray)]">
                Thank you for submitting your data rights request.
              </p>
            </div>

            <div className="bg-[var(--off-white)] border border-[var(--light-gray)] p-6 rounded-[4px] mb-6">
              <div className="flex flex-col gap-4">
                <div>
                  <p className="label text-[var(--cool-gray)]">Request ID</p>
                  <p className="body font-medium">{id}</p>
                </div>
                <div>
                  <p className="label text-[var(--cool-gray)]">Expected Response</p>
                  <p className="body">Within 30 days (by GDPR Article 12)</p>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="mb-4">What happens next?</h4>
              <ul className="flex flex-col gap-3 body">
                <li className="flex gap-3">
                  <span className="text-[var(--teal)]">1.</span>
                  <span>We have sent a confirmation email to your inbox</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-[var(--teal)]">2.</span>
                  <span>Our team will review your request and verify your identity</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-[var(--teal)]">3.</span>
                  <span>You will receive a response via email within 30 days</span>
                </li>
              </ul>
            </div>

            <div className="flex flex-col gap-4">
              <Button variant="primary" onClick={() => window.location.href = '/privacy/request'}>
                Submit Another Request
              </Button>
              <Link href="/">
                <Button variant="secondary" className="w-full">
                  Return to Home
                </Button>
              </Link>
            </div>

            <div className="mt-8 pt-6 border-t border-[var(--light-gray)]">
              <p className="caption text-[var(--cool-gray)] text-center">
                Questions? Contact us at{' '}
                <a href="mailto:privacy@cofactor.world" className="text-[var(--teal)] underline">
                  privacy@cofactor.world
                </a>
              </p>
            </div>
          </Card>

        </div>
      </div>
    </FadeInOnLoad>
  )
}
