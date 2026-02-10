/**
 * Content Filtering
 * Filters content for profanity, hate speech, and personal information
 */

import DOMPurify from 'isomorphic-dompurify'
import { getConfig } from './config'
import { logger } from '@/lib/logger'

export interface FilterResult {
    passed: boolean
    violations: FilterViolation[]
    filteredContent: string
    sanitizedContent?: string // Alias for compatibility
}

export interface FilterViolation {
    type: 'profanity' | 'hate_speech' | 'personal_info' | 'blocked_domain' | 'blocked_url'
    severity: 'low' | 'medium' | 'high'
    message: string
    matchedContent?: string
}

export function filterContent(content: string): FilterResult {
    const config = getConfig()
    const violations: FilterViolation[] = []

    // Check for profanity
    const profanityCheck = checkProfanity(content, config)
    violations.push(...profanityCheck)

    // Check for hate speech
    const hateSpeechCheck = checkHateSpeech(content, config)
    violations.push(...hateSpeechCheck)

    // Check for personal information
    const personalInfoCheck = checkPersonalInfo(content, config)
    violations.push(...personalInfoCheck)

    // Check for blocked domains/URLs
    const blockedContentCheck = checkBlockedContent(content, config)
    violations.push(...blockedContentCheck)

    return {
        passed: violations.length === 0,
        violations,
        filteredContent: sanitizeContent(content),
        sanitizedContent: sanitizeContent(content) // Alias for compatibility
    }
}

export interface ValidateResult {
    valid: boolean
    errors: string[]
}

export function validateContent(content: string, options?: any): ValidateResult {
    const result = filterContent(content)
    return {
        valid: result.passed,
        errors: result.violations.map(v => v.message)
    }
}

function checkProfanity(content: string, config: any): FilterViolation[] {
    const violations: FilterViolation[] = []
    const lowerContent = content.toLowerCase()

    config.profanityKeywords.forEach((keyword: string) => {
        if (lowerContent.includes(keyword.toLowerCase())) {
            violations.push({
                type: 'profanity',
                severity: 'medium',
                message: 'Profanity detected',
                matchedContent: keyword
            })
        }
    })

    return violations
}

function checkHateSpeech(content: string, config: any): FilterViolation[] {
    const violations: FilterViolation[] = []

    config.hateSpeechPatterns.forEach((pattern: string) => {
        try {
            const regex = new RegExp(pattern, 'gi')
            const matches = content.match(regex)
            if (matches && matches.length > 0) {
                violations.push({
                    type: 'hate_speech',
                    severity: 'high',
                    message: 'Hate speech detected',
                    matchedContent: matches[0]
                })
            }
        } catch (e) {
            logger.warn('Invalid hate speech pattern', { pattern, error: e instanceof Error ? e.message : String(e) })
        }
    })

    return violations
}

function checkPersonalInfo(content: string, config: any): FilterViolation[] {
    const violations: FilterViolation[] = []

    config.personalInfoPatterns.forEach((pattern: string) => {
        try {
            const regex = new RegExp(pattern, 'g')
            const matches = content.match(regex)
            if (matches && matches.length > 0) {
                violations.push({
                    type: 'personal_info',
                    severity: 'high',
                    message: 'Personal information detected (email, phone, etc.)',
                    matchedContent: matches[0].substring(0, 20) + '...'
                })
            }
        } catch (e) {
            logger.warn('Invalid personal info pattern', { pattern, error: e instanceof Error ? e.message : String(e) })
        }
    })

    return violations
}

function checkBlockedContent(content: string, config: any): FilterViolation[] {
    const violations: FilterViolation[] = []
    const urlRegex = /https?:\/\/[^\s<>"{}|\\^`\[\]]+/gi
    const urls = content.match(urlRegex) || []

    // Check against blocked domains
    urls.forEach(url => {
        const lowerUrl = url.toLowerCase()
        config.suspiciousDomains.forEach((domain: string) => {
            if (lowerUrl.includes(domain.toLowerCase())) {
                violations.push({
                    type: 'blocked_domain',
                    severity: 'high',
                    message: 'Blocked domain detected',
                    matchedContent: domain
                })
            }
        })
    })

    return violations
}

function sanitizeContent(content: string): string {
    const sanitized = DOMPurify.sanitize(content, {
        ALLOWED_TAGS: ['p', 'br', 'b', 'i', 'u', 'strong', 'em', 'a', 'ul', 'ol', 'li'],
        ALLOWED_ATTR: ['href', 'title', 'target'],
        KEEP_CONTENT: true
    })

    return sanitized
}

export function maskPersonalInfo(content: string): string {
    const config = getConfig()
    let masked = content

    masked = masked.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, (match) => {
        const [local, domain] = match.split('@')
        const visibleChars = Math.min(2, local.length)
        return `${local.substring(0, visibleChars)}***@${domain}`
    })

    masked = masked.replace(/\b(\d{3})[-.]?(\d{3})[-.]?(\d{4})\b/g, '$1-***-***')
    masked = masked.replace(/\b\+?(\d{1,3})[-. ]?\((\d{3})\)[-./ ]?(\d{3})[-./ ]?(\d{4})\b/g, '+$1 ($2) ***-****')
    masked = masked.replace(/\b(\d{4})[ -]?(\d{4})[ -]?(\d{4})[ -]?(\d{4})\b/g, '$1-****-****-****')
    masked = masked.replace(/\b(\d{3})-(\d{2})-(\d{4})\b/g, '***-**-****')

    return masked
}

export function getContentSummary(content: string, maxLength: number = 200): string {
    const cleanContent = sanitizeContent(content)
    const textOnly = cleanContent.replace(/<[^>]+>/g, '')
    const trimmed = textOnly.trim()

    if (trimmed.length <= maxLength) {
        return trimmed
    }

    return trimmed.substring(0, maxLength) + '...'
}
