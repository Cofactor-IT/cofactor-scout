import DOMPurify from 'isomorphic-dompurify'
import { getConfig } from './config'
import { logger } from '@/lib/logger'

export interface SpamAnalysis {
    score: number
    actions: any[]
    details: {
        linkCount: number
        shortenedLinks: number
        suspiciousLinks: string[]
        capsRatio: number
        repeatedChars: string[]
        repeatedWords: string[]
        spamKeywordsFound: string[]
        suspiciousHtml: boolean
        htmlIssues: string[]
    }
}

export function detectSpam(content: string): any {
    const config = getConfig()
    const cleanContent = DOMPurify.sanitize(content, { ALLOWED_TAGS: [] })
    
    const analysis: SpamAnalysis = {
        score: 0,
        actions: [],
        details: {
            linkCount: 0,
            shortenedLinks: 0,
            suspiciousLinks: [],
            capsRatio: 0,
            repeatedChars: [],
            repeatedWords: [],
            spamKeywordsFound: [],
            suspiciousHtml: false,
            htmlIssues: []
        }
    }
    
    checkLinks(content, analysis, config)
    checkCapsRatio(content, analysis, config)
    checkRepetitions(content, analysis, config)
    checkSpamKeywords(content, analysis, config)
    checkSuspiciousHTML(content, analysis, config)
    
    const result = analyzeResults(analysis, config)
    
    if (result.shouldAutoReject) {
        logger.warn('Auto-rejecting spam content', {
            score: result.score,
            reasons: result.reasons,
            contentLength: content.length
        })
    }
    
    return result
}

function checkLinks(content: string, analysis: SpamAnalysis, config: any): void {
    const urlRegex = /https?:\/\/[^\s<>"{}|\\^`\[\]]+/gi
    const urls = content.match(urlRegex) || []
    analysis.details.linkCount = urls.length
    
    if (urls.length > config.maxLinks) {
        const score = 20
        analysis.score += score
        analysis.actions.push({
            type: 'spam_detected',
            score,
            reason: `Too many links (${urls.length}, max: ${config.maxLinks})`,
            severity: 'medium'
        })
    }
    
    const shortenedLinks = urls.filter(url => {
        return config.urlShortenerDomains.some((domain: string) => url.toLowerCase().includes(domain))
    })
    analysis.details.shortenedLinks = shortenedLinks.length
    
    if (shortenedLinks.length > config.maxShortenedLinks) {
        const score = 15
        analysis.score += score
        analysis.actions.push({
            type: 'spam_detected',
            score,
            reason: `Too many shortened URLs (${shortenedLinks.length}, max: ${config.maxShortenedLinks})`,
            severity: 'medium'
        })
    }
    
    const suspiciousLinks = urls.filter(url => {
        return config.suspiciousDomains.some((domain: string) => url.toLowerCase().includes(domain))
    })
    analysis.details.suspiciousLinks = suspiciousLinks
    
    if (suspiciousLinks.length > 0) {
        analysis.score += 30
        analysis.actions.push({
            type: 'spam_detected',
            score: 30,
            reason: 'Links to suspicious/blacklisted domains',
            severity: 'high'
        })
    }
}

function checkCapsRatio(content: string, analysis: SpamAnalysis, config: any): void {
    const cleanContent = content.replace(/<[^>]*>/g, '')
    const letters = cleanContent.replace(/[^a-zA-Z]/g, '')
    const caps = (cleanContent.match(/[A-Z]/g) || []).length
    
    if (letters.length > 20) {
        analysis.details.capsRatio = letters.length > 0 ? caps / letters.length : 0
        
        if (analysis.details.capsRatio > config.maxCapsRatio) {
            analysis.score += 15
            analysis.actions.push({
                type: 'spam_detected',
                score: 15,
                reason: `Excessive CAPS usage (${(analysis.details.capsRatio * 100).toFixed(0)}%)`,
                severity: 'low'
            })
        }
    }
}

function checkRepetitions(content: string, analysis: SpamAnalysis, config: any): void {
    const charRegex = /(.)\1{9,}/g
    const charMatches = content.match(charRegex) || []
    
    if (charMatches.length > 0) {
        analysis.details.repeatedChars = charMatches
        analysis.score += 10
        analysis.actions.push({
            type: 'spam_detected',
            score: 10,
            reason: 'Character flooding detected',
            severity: 'low'
        })
    }
    
    const words = content.toLowerCase().match(/\b\w+\b/g) || []
    const wordCounts = new Map<string, number>()
    
    words.forEach(word => {
        if (word.length > 3) {
            wordCounts.set(word, (wordCounts.get(word) || 0) + 1)
        }
    })
    
    const repeatedWords = Array.from(wordCounts.entries())
        .filter(([_, count]) => count >= config.maxRepeatedWords)
        .map(([word, _]) => word)
    
    if (repeatedWords.length > 0) {
        analysis.details.repeatedWords = repeatedWords
        analysis.score += 10
        analysis.actions.push({
            type: 'spam_detected',
            score: 10,
            reason: 'Word repetition detected',
            severity: 'low'
        })
    }
}

function checkSpamKeywords(content: string, analysis: SpamAnalysis, config: any): void {
    const lowerContent = content.toLowerCase()
    const foundKeywords: string[] = []
    
    config.spamKeywords.forEach((keyword: string) => {
        if (lowerContent.includes(keyword.toLowerCase())) {
            foundKeywords.push(keyword)
        }
    })
    
    analysis.details.spamKeywordsFound = foundKeywords
    
    if (foundKeywords.length > 0) {
        const score = Math.min(foundKeywords.length * 10, 40)
        analysis.score += score
        analysis.actions.push({
            type: 'spam_detected',
            score,
            reason: `Spam keywords detected: ${foundKeywords.join(', ')}`,
            severity: foundKeywords.length > 3 ? 'high' : 'medium'
        })
    }
}

function checkSuspiciousHTML(content: string, analysis: SpamAnalysis, config: any): void {
    const issues: string[] = []
    let suspicious = false
    
    if (content.includes('display:none') || content.includes('visibility:hidden')) {
        issues.push('Hidden text detected')
        suspicious = true
    }
    
    if (content.includes('font-size:0') || content.includes('font-size: 0')) {
        issues.push('Tiny font size detected')
        suspicious = true
    }
    
    if (content.includes('letter-spacing:') && content.includes('99')) {
        issues.push('Obfuscated text detected')
        suspicious = true
    }
    
    const htmlTagCount = (content.match(/<[^>]+>/g) || []).length
    const textContent = content.replace(/<[^>]+>/g, '')
    if (htmlTagCount > 0 && textContent.length / htmlTagCount < 3) {
        issues.push('Excessive HTML tags')
        suspicious = true
    }
    
    const eventHandlers = content.match(/on\w+\s*=/gi) || []
    if (eventHandlers.length > 0) {
        issues.push('Inline event handlers detected')
        suspicious = true
    }
    
    analysis.details.suspiciousHtml = suspicious
    analysis.details.htmlIssues = issues
    
    if (suspicious) {
        analysis.score += 25
        analysis.actions.push({
            type: 'spam_detected',
            score: 25,
            reason: `Suspicious HTML: ${issues.join(', ')}`,
            severity: 'high'
        })
    }
}

function analyzeResults(analysis: SpamAnalysis, config: any): any {
    const reasons = analysis.actions.map((a: any) => a.reason)
    
    return {
        passed: analysis.score < config.autoRejectThreshold,
        score: Math.min(analysis.score, 100),
        reasons,
        shouldAutoReject: analysis.score >= config.autoRejectThreshold,
        shouldAutoApprove: analysis.score <= config.approveThreshold,
        requiresManualReview: analysis.score >= config.manualReviewThreshold && analysis.score < config.autoRejectThreshold
    }
}

export function calculateSimilarity(content1: string, content2: string): number {
    if (content1 === content2) return 1
    
    const longer = content1.length > content2.length ? content1 : content2
    const shorter = content1.length > content2.length ? content2 : content1
    
    if (longer.length === 0) return 1
    
    const distance = levenshteinDistance(longer, shorter)
    return (longer.length - distance) / longer.length
}

function levenshteinDistance(str1: string, str2: string): number {
    const matrix: number[][] = []
    
    for (let i = 0; i <= str2.length; i++) {
        matrix[i] = [i]
    }
    
    for (let j = 0; j <= str1.length; j++) {
        matrix[0][j] = j
    }
    
    for (let i = 1; i <= str2.length; i++) {
        for (let j = 1; j <= str1.length; j++) {
            if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1]
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j] + 1
                )
            }
        }
    }
    
    return matrix[str2.length][str1.length]
}
