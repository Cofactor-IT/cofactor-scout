/**
 * @file utils.ts
 * @description Shared utility functions for reading and writing the consent cookie.
 * Eliminates duplicated cookie logic across Banner.tsx and Trigger.tsx.
 */

import { ConsentState } from './types'
import { CONSENT_COOKIE_NAME, CONSENT_COOKIE_MAX_AGE } from './constants'

/**
 * Reads the current consent state from the browser cookie.
 * @returns The parsed ConsentState if the cookie exists and is valid, otherwise null.
 */
export function readConsentCookie(): ConsentState | null {
    const match = document.cookie.match(new RegExp(`(^| )${CONSENT_COOKIE_NAME}=([^;]+)`))
    if (!match) return null
    try {
        return JSON.parse(decodeURIComponent(match[2])) as ConsentState
    } catch {
        return null
    }
}

/**
 * Writes the consent state to the browser cookie.
 * @param consent - The consent preferences to persist.
 */
export function writeConsentCookie(consent: ConsentState): void {
    document.cookie = `${CONSENT_COOKIE_NAME}=${encodeURIComponent(JSON.stringify(consent))}; path=/; max-age=${CONSENT_COOKIE_MAX_AGE}; samesite=strict`
}

/**
 * Sends the consent state to the backend API for logging.
 * Fire-and-forget — failures are silently ignored.
 * @param consent - The consent preferences to record.
 */
export function recordConsentOnBackend(consent: ConsentState): void {
    fetch('/api/consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(consent)
    }).catch(() => { })
}
