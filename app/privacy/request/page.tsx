/**
 * privacy/request/page.tsx
 *
 * Data Subject Request page for Cofactor Scout.
 * Allows users to submit GDPR data rights requests (access, erasure,
 * portability, rectification, restriction, objection).
 *
 * Status: Scaffold only — form implementation is SCOUT-48.
 * This page ships when SCOUT-48 is complete and PRIVACY_PAGES_ENABLED=true.
 *
 * Coordinate with SCOUT-48 before adding form content here.
 */

import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Submit a Privacy Request | Cofactor Scout',
    description: 'Exercise your GDPR data rights — request access, deletion, or correction of your personal data held by Cofactor Scout.'
}

/**
 * Data Subject Request page.
 * Form component will be implemented in SCOUT-48 and imported here.
 */
export default function PrivacyRequestPage() {
    return (
        <div className="px-4 md:px-8 lg:px-[120px] py-12 md:py-[80px]">
            <div className="max-w-[800px] mx-auto">

                <h1 className="mb-4">Submit a Privacy Request</h1>
                <p className="body-large text-[#6B7280] mb-12">
                    You can exercise your data rights under GDPR by completing the form below.
                    We will respond within 30 days of receiving your request.
                </p>

                {/* ============================================
                    FORM PLACEHOLDER — SCOUT-48
                    The data subject request form is being built in SCOUT-48.
                    Import and render the form component here once SCOUT-48 ships.

                    Example:
                    import { DataSubjectRequestForm } from '@/components/privacy/DataSubjectRequestForm'
                    <DataSubjectRequestForm />
                ============================================ */}
                <div className="body text-[#6B7280] italic">
                    Form coming soon — see SCOUT-48.
                </div>

            </div>
        </div>
    )
}
