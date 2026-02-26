"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { CookieModal } from './Modal'

export type ConsentState = {
    analytics: boolean;
    error: boolean;
    version: number;
}

const DEFAULT_CONSENT: ConsentState = {
    analytics: false,
    error: false,
    version: 1
}

export function CookieBanner() {
    const [isVisible, setIsVisible] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [currentConsent, setCurrentConsent] = useState<ConsentState>(DEFAULT_CONSENT)

    useEffect(() => {
        // Check array of cookies for cf_consent
        const match = document.cookie.match(new RegExp('(^| )cf_consent=([^;]+)'))
        if (match) {
            try {
                const storedConsent = JSON.parse(decodeURIComponent(match[2]))
                setCurrentConsent(storedConsent)
            } catch (e) {
                setIsVisible(true) // Invalid cookie -> show banner
            }
        } else {
            setIsVisible(true)
        }
    }, [])

    const handleSave = async (consent: ConsentState) => {
        // 6 months expiration
        const maxAge = 60 * 60 * 24 * 182

        document.cookie = `cf_consent=${encodeURIComponent(JSON.stringify(consent))}; path=/; max-age=${maxAge}; samesite=strict`

        setIsVisible(false)
        setIsModalOpen(false)
        setCurrentConsent(consent)

        try {
            // Attempt to record consent on backend (fire and forget)
            fetch('/api/consent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(consent)
            }).catch(() => { })
        } catch (e) {
            // Ignore
        }

        // Reload so Sentry and Analytics evaluate correctly
        window.location.reload()
    }

    const acceptAll = () => handleSave({ analytics: true, error: true, version: 1 })
    const rejectAll = () => handleSave({ analytics: false, error: false, version: 1 })

    if (!isVisible) return null

    return (
        <>
            <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t shadow-lg p-4 md:p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex-1 max-w-4xl">
                    <h3 className="font-semibold text-lg mb-2 text-foreground">We value your privacy</h3>
                    <p className="text-sm text-muted-foreground">
                        We use cookies to improve your experience. We use non-essential cookies for analytics (Vercel) and error monitoring (Sentry), which may transfer data according to their policies. You can choose to accept all, reject all non-essential, or customize your preferences. Review our <Link href="/privacy" className="underline hover:text-foreground">Privacy Policy</Link> for details.
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="px-4 py-2 text-sm font-medium border rounded-md hover:bg-muted whitespace-nowrap"
                    >
                        Customize
                    </button>
                    <button
                        onClick={rejectAll}
                        className="px-4 py-2 text-sm font-medium border rounded-md hover:bg-muted whitespace-nowrap"
                    >
                        Reject All
                    </button>
                    <button
                        onClick={acceptAll}
                        className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 whitespace-nowrap"
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
