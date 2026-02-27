/**
 * @file types.ts
 * @description Shared TypeScript types for the cookie consent system.
 * Single source of truth — import from here in Banner, Modal, Trigger, and route.
 */

export type ConsentState = {
    /** Whether the user has consented to analytics cookies (Vercel Analytics) */
    analytics: boolean
    /** Whether the user has consented to error monitoring cookies (Sentry) */
    error: boolean
    /** Schema version — used to detect outdated consent records */
    version: number
}
