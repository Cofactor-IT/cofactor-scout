/**
 * Moderation System Configuration
 * Centralized configuration for content moderation rules
 */

export interface SpamDetectionConfig {
    // Score thresholds (0-100)
    autoRejectThreshold: number
    manualReviewThreshold: number
    approveThreshold: number
    
    // Link detection
    maxLinks: number
    maxShortenedLinks: number
    suspiciousDomains: string[]
    urlShortenerDomains: string[]
    
    // Content patterns
    maxCapsRatio: number // 0-1, where 1 is all caps
    maxRepeatedCharacters: number
    maxRepeatedWords: number
    minContentLength: number
    maxContentLength: number
    
    // Keywords
    spamKeywords: string[]
    profanityKeywords: string[]
    hateSpeechPatterns: string[]
    personalInfoPatterns: string[]
    
    // Reputation thresholds
    trustedUserScore: number
    suspiciousUserScore: number
    autoApproveReputation: number
    autoFlagReputation: number
}

export const spamDetectionConfig: SpamDetectionConfig = {
    // Score thresholds
    autoRejectThreshold: 80,
    manualReviewThreshold: 40,
    approveThreshold: 20,
    
    // Link detection
    maxLinks: 5,
    maxShortenedLinks: 2,
    suspiciousDomains: [
        'spam.com',
        'malicious.com',
        'phishing.com',
    ],
    urlShortenerDomains: [
        'bit.ly',
        'tinyurl.com',
        'goo.gl',
        't.co',
        'buff.ly',
        'ow.ly',
        'is.gd',
        'bit.do',
    ],
    
    // Content patterns
    maxCapsRatio: 0.7,
    maxRepeatedCharacters: 10,
    maxRepeatedWords: 5,
    minContentLength: 10,
    maxContentLength: 50000,
    
    // Keywords
    spamKeywords: [
        'free money',
        'win prize',
        'click here now',
        'click here!!!',
        'winner!',
        'congratulations!!!',
        'limited time offer',
        'act now',
        'urgent',
        'verified account',
        'bitcoin investment',
        'cryptocurrency giveaway',
        'earn $',
        'make money fast',
        'work from home',
        'easy money',
        'hot deal',
        'best deal',
        'viagra',
        'cialis',
        'casino',
        'poker',
        'lottery',
        'jackpot',
    ],
    profanityKeywords: [
        // Profanity list placeholders - customize based on your needs
        // Replace with actual blocked words
    ],
    hateSpeechPatterns: [
        // Hate speech detection patterns
        // Enhance with proper ML-based detection for production
    ],
    personalInfoPatterns: [
        // Email detection
        '\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b',
        // Phone detection
        '\b\d{3}[-.]?\d{3}[-.]?\d{4}\b',
        '\b\+?\d{1,3}[-. ]?\(\d{3}\)[-./ ]?\d{3}[-./ ]?\d{4}\b',
        // Credit card detection
        '\b\d{4}[ -]?\d{4}[ -]?\d{4}[ -]?\d{4}\b',
    ],
    
    // Reputation thresholds
    trustedUserScore: 0.85,
    suspiciousUserScore: 0.5,
    autoApproveReputation: 80,
    autoFlagReputation: 30,
}

export interface ModerationResult {
    passed: boolean
    score: number
    reasons: string[]
    shouldAutoReject: boolean
    shouldAutoApprove: boolean
    requiresManualReview: boolean
}

export interface ModerationAction {
    type: 'spam_detected' | 'profanity_detected' | 'hate_speech_detected' | 'personal_info_detected'
    score: number
    reason: string
    severity: 'low' | 'medium' | 'high'
}

export function getConfig(): SpamDetectionConfig {
    return spamDetectionConfig
}

export function updateConfig(updates: Partial<SpamDetectionConfig>): void {
    Object.assign(spamDetectionConfig, updates)
}

export const MODERATION_FEATURES = {
    SPAM_DETECTION: process.env.FEATURE_SPAM_DETECTION !== 'false',
    CONTENT_FILTERING: process.env.FEATURE_CONTENT_FILTERING !== 'false',
    REPUTATION_SYSTEM: process.env.FEATURE_REPUTATION_SYSTEM !== 'false',
    USER_REPORTING: process.env.FEATURE_USER_REPORTING !== 'false',
} as const
