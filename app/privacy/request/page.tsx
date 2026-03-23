/**
 * privacy/request/page.tsx
 *
 * Data Subject Request page for Cofactor Scout.
 * Allows users to submit GDPR data rights requests (access, erasure,
 * portability, rectification, restriction, objection).
 *
 * Fully functional form with validation, email confirmation, and tracking.
 */

import type { Metadata } from 'next'
import { DataSubjectRequestForm } from '@/components/privacy/DataSubjectRequestForm'
import { FadeInOnLoad } from '@/components/ui/FadeInOnLoad'

export const metadata: Metadata = {
  title: 'Submit a Privacy Request | Cofactor Scout',
  description: 'Exercise your GDPR data rights — request access, deletion, or correction of your personal data held by Cofactor Scout.'
}

/**
 * Data Subject Request page with submission form.
 */
export default function PrivacyRequestPage() {
  return (
    <FadeInOnLoad delay={0.2}>
      <div className="px-4 md:px-8 lg:px-[120px] py-12 md:py-[80px]">
        <div className="max-w-[800px] mx-auto">

          <h1 className="mb-4">Submit a Privacy Request</h1>
          <p className="body-large text-[var(--cool-gray)] mb-12">
            You can exercise your data rights under GDPR by completing the form below.
            We will respond within 30 days of receiving your request.
          </p>

          <DataSubjectRequestForm />

        </div>
      </div>
    </FadeInOnLoad>
  )
}
