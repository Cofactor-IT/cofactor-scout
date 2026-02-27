/**
 * @file Trigger.tsx
 * @description Cookie settings trigger button.
 * Allows users to reopen cookie preferences after initial consent.
 */
"use client"

import { useState, useEffect } from 'react'
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
 * Cookie consent trigger button component.
 * Displays a "Cookie Settings" link that reopens the preferences modal.
 * @returns Button and modal for managing cookie preferences
 */
export function CookieConsentTrigger() {
    const [showCookieModal, setShowCookieModal] = useState(false)
    const [cookieConsent, setCookieConsent] = useState<ConsentState>(DEFAULT_CONSENT)

    useEffect(() => {
        const storedConsent = readConsentCookie()
        if (storedConsent) {
            setCookieConsent(storedConsent)
        }
    }, [])

    /**
     * Saves consent preferences to cookie, records on backend, and reloads page.
     * @param consent - User's consent preferences
     */
    const handleSaveCookie = (consent: ConsentState) => {
        writeConsentCookie(consent)
        setShowCookieModal(false)
        setCookieConsent(consent)
        recordConsentOnBackend(consent)
        window.location.reload()
    }

    return (
        <>
            <button
                onClick={() => setShowCookieModal(true)}
                className="caption text-[#6B7280] hover:text-[#1B2A4A] underline"
            >
                Cookie Settings
            </button>

            <CookieModal
                isOpen={showCookieModal}
                onClose={() => setShowCookieModal(false)}
                onSave={handleSaveCookie}
                initialState={cookieConsent}
            />
        </>
    )
}
