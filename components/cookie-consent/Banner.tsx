/**
 * @file Banner.tsx
 * @description Cookie consent banner component.
 * Displays on first visit and allows users to accept/reject/customize cookie preferences.
 */
"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { CookieModal } from './Modal'
import { ConsentState } from './types'
import { CONSENT_VERSION } from './constants'
import { readConsentCookie, writeConsentCookie, recordConsentOnBackend } from './utils'

const DEFAULT_CONSENT: ConsentState = {
    analytics: false,
    error: false,
    version: CONSENT_VERSION
}

/**
 * Cookie consent banner component.
 * Shows on first visit, allows users to accept all, reject all, or customize preferences.
 * @returns Cookie banner with action buttons and customization modal
 */
export function CookieBanner() {
    const [isVisible, setIsVisible] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [currentConsent, setCurrentConsent] = useState<ConsentState>(DEFAULT_CONSENT)

    useEffect(() => {
        const storedConsent = readConsentCookie()
        if (storedConsent) {
            setTimeout(() => setCurrentConsent(storedConsent), 0)
        } else {
            setTimeout(() => setIsVisible(true), 0)
        }
    }, [])

    /**
     * Saves consent preferences to cookie, records on backend, and reloads page.
     * @param consent - User's consent preferences
     */
    const handleSave = async (consent: ConsentState) => {
        writeConsentCookie(consent)

        setIsVisible(false)
        setIsModalOpen(false)
        setCurrentConsent(consent)

        recordConsentOnBackend(consent)

        // Reload so Sentry evaluates the updated consent state
        window.location.reload()
    }

    /**
     * Accepts all optional data sharing (error monitoring).
     */
    const acceptAll = () => handleSave({ analytics: false, error: true, version: CONSENT_VERSION })
    
    /**
     * Rejects all non-essential cookie categories.
     */
    const rejectAll = () => handleSave({ analytics: false, error: false, version: CONSENT_VERSION })

    if (!isVisible) return null

    return (
        <>
            <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#E5E7EB] shadow-lg p-4 md:p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex-1 max-w-4xl">
                    <h4 className="mb-2">We value your privacy</h4>

                    <p className="body text-sm text-[#6B7280]">
                        We use one strictly necessary cookie for authentication. We also send error diagnostic data to Sentry (USA) under Standard Contractual Clauses to help us identify and fix issues. You can opt out of error monitoring below. Review our{' '}
                        <Link href="/privacy/policy" className="underline hover:text-[#1B2A4A]" style={{ color: '#6B7280' }}>Privacy Policy</Link>{' '}
                        for details.
                    </p>

                </div>
                <div className="flex flex-col sm:flex-row gap-2 shrink-0 w-full sm:w-auto">
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="button border border-[#E5E7EB] rounded-md hover:bg-[#FAFBFC] whitespace-nowrap"
                        style={{ color: '#1B2A4A' }}
                    >
                        Customize
                    </button>
                    <button
                        onClick={rejectAll}
                        className="button border border-[#E5E7EB] rounded-md hover:bg-[#FAFBFC] whitespace-nowrap"
                        style={{ color: '#1B2A4A' }}
                    >
                        Reject All
                    </button>
                    <button
                        onClick={acceptAll}
                        className="button bg-[#0D7377] text-white rounded-md hover:bg-[#0A5A5D] whitespace-nowrap"
                    >
                        Accept All
                    </button>
                </div>
            </div>

            <CookieModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                initialState={currentConsent}
            />
        </>
    )
}
