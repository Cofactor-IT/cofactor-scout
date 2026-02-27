/**
 * @file constants.ts
 * @description Shared constants for the cookie consent system.
 * Centralises magic values to avoid duplication across Banner, Trigger, and API route.
 */

export const CONSENT_COOKIE_NAME = 'cf_consent'
export const CONSENT_COOKIE_MAX_AGE = 60 * 60 * 24 * 182
export const CONSENT_VERSION = 1
