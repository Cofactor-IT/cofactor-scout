"use client"

import { useState, useEffect } from 'react'
import { CookieModal } from './Modal'

export function CookieConsentTrigger() {
    const [showCookieModal, setShowCookieModal] = useState(false)
    const [cookieConsent, setCookieConsent] = useState({ analytics: false, error: false, version: 1 })

    useEffect(() => {
        const match = document.cookie.match(new RegExp('(^| )cf_consent=([^;]+)'))
        if (match) {
            try {
                setCookieConsent(JSON.parse(decodeURIComponent(match[2])))
            } catch (e) { }
        }
    }, [])

    const handleSaveCookie = (consent: { analytics: boolean, error: boolean, version: number }) => {
        const maxAge = 60 * 60 * 24 * 182
        document.cookie = `cf_consent=${encodeURIComponent(JSON.stringify(consent))}; path=/; max-age=${maxAge}; samesite=strict`
        setShowCookieModal(false)
        setCookieConsent(consent)
        try {
            fetch('/api/consent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(consent)
            }).catch(() => { })
        } catch (e) { }
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
