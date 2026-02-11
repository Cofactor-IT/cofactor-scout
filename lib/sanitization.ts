import DOMPurify from 'isomorphic-dompurify'

/**
 * Comprehensive input sanitization utilities
 * Provides security-focused input validation and sanitization
 */

// ============================================================================
// ZERO-WIDTH CHARACTER REMOVAL
// ============================================================================

const ZERO_WIDTH_CHARS = /[\u200B-\u200D\uFEFF\u2060\u2061\u2062\u2063\u2064\u206A-\u206F]/g

/**
 * Remove zero-width characters that can be used for fingerprinting or obfuscation
 */
export function removeZeroWidthChars(input: string): string {
    return input.replace(ZERO_WIDTH_CHARS, '')
}

// ============================================================================
// UNICODE NORMALIZATION
// ============================================================================

/**
 * Normalize Unicode to NFKC form to prevent homograph attacks
 * and ensure consistent string comparison
 */
export function normalizeUnicode(input: string): string {
    return input.normalize('NFKC')
}

// ============================================================================
// WHITESPACE NORMALIZATION
// ============================================================================

const EXCESSIVE_WHITESPACE = /\s+/g
// Exclude \t (0x09), \n (0x0A), \r (0x0D) from control chars so they are handled by whitespace normalization
const CONTROL_CHARS = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g

/**
 * Normalize whitespace in strings
 * - Replace multiple whitespace characters with single space
 * - Remove control characters
 * - Trim leading/trailing whitespace
 */
export function normalizeWhitespace(input: string): string {
    return input
        .replace(CONTROL_CHARS, '')
        .replace(EXCESSIVE_WHITESPACE, ' ')
        .trim()
}

// ============================================================================
// URL VALIDATION AND SANITIZATION
// ============================================================================

const DANGEROUS_PROTOCOLS = /^(javascript|data|vbscript|file):/i
const ALLOWED_PROTOCOLS = /^https?:$/i

interface UrlValidationResult {
    isValid: boolean
    sanitizedUrl: string | null
    error?: string
}

/**
 * Validate and sanitize a URL
 * - Reject dangerous protocols (javascript:, data:, vbscript:, file:)
 * - Ensure URL uses http: or https:
 * - Basic URL structure validation
 */
export function validateAndSanitizeUrl(url: string): UrlValidationResult {
    if (!url || typeof url !== 'string') {
        return { isValid: false, sanitizedUrl: null, error: 'URL is required' }
    }

    const trimmed = url.trim()

    if (trimmed.length === 0) {
        return { isValid: false, sanitizedUrl: null, error: 'URL cannot be empty' }
    }

    if (trimmed.length > 2048) {
        return { isValid: false, sanitizedUrl: null, error: 'URL is too long' }
    }

    // Check for dangerous protocols
    if (DANGEROUS_PROTOCOLS.test(trimmed)) {
        return { isValid: false, sanitizedUrl: null, error: 'Invalid URL protocol' }
    }

    try {
        // Add protocol if missing
        let urlToParse = trimmed
        if (!/^https?:\/\//i.test(trimmed)) {
            urlToParse = 'https://' + trimmed
        }

        const parsed = new URL(urlToParse)

        // Ensure protocol is http or https
        if (!ALLOWED_PROTOCOLS.test(parsed.protocol)) {
            return { isValid: false, sanitizedUrl: null, error: 'Invalid URL protocol' }
        }

        return {
            isValid: true,
            sanitizedUrl: parsed.toString()
        }
    } catch {
        return { isValid: false, sanitizedUrl: null, error: 'Invalid URL format' }
    }
}

// Domain patterns for social media validation
const SOCIAL_DOMAIN_PATTERNS = {
    linkedin: /^https:\/\/(www\.)?linkedin\.com\//i,
    twitter: /^https:\/\/(www\.)?(twitter\.com|x\.com)\//i,
    googleScholar: /^https:\/\/(scholar\.google\.com|scholar\.google\.[^\/]+)\//i,
    researchGate: /^https:\/\/(www\.)?researchgate\.net\//i,
    instagram: /^https:\/\/(www\.)?instagram\.com\//i,
    tiktok: /^https:\/\/(www\.)?tiktok\.com\/@/i
}

/**
 * Validate social media URLs for specific platforms
 */
export function validateSocialUrl(url: string, platform: keyof typeof SOCIAL_DOMAIN_PATTERNS): UrlValidationResult {
    const baseValidation = validateAndSanitizeUrl(url)

    if (!baseValidation.isValid) {
        return baseValidation
    }

    const pattern = SOCIAL_DOMAIN_PATTERNS[platform]
    if (!pattern.test(baseValidation.sanitizedUrl!)) {
        return {
            isValid: false,
            sanitizedUrl: null,
            error: `Invalid ${platform} URL format`
        }
    }

    return baseValidation
}

// ============================================================================
// FILE UPLOAD VALIDATION
// ============================================================================

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const
export const ALLOWED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'] as const
export const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
export const MAX_AVATAR_SIZE = 2 * 1024 * 1024 // 2MB for avatars

// Magic bytes for image validation
const IMAGE_MAGIC_BYTES: Record<string, Buffer> = {
    'image/jpeg': Buffer.from([0xFF, 0xD8, 0xFF]),
    'image/png': Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]),
    'image/webp': Buffer.from([0x52, 0x49, 0x46, 0x46])
}

interface FileValidationResult {
    isValid: boolean
    error?: string
}

/**
 * Validate file type by MIME type
 */
export function validateFileType(mimeType: string, allowedTypes: readonly string[]): FileValidationResult {
    if (!allowedTypes.includes(mimeType)) {
        return {
            isValid: false,
            error: `Invalid file type. Allowed: ${allowedTypes.join(', ')}`
        }
    }
    return { isValid: true }
}

/**
 * Validate file size
 */
export function validateFileSize(size: number, maxSize: number): FileValidationResult {
    if (size > maxSize) {
        return {
            isValid: false,
            error: `File too large. Maximum size: ${Math.round(maxSize / 1024 / 1024)}MB`
        }
    }
    return { isValid: true }
}

/**
 * Validate file content using magic bytes
 * This prevents files with fake extensions from being uploaded
 */
export function validateFileMagicBytes(buffer: Buffer, mimeType: string): FileValidationResult {
    const magic = IMAGE_MAGIC_BYTES[mimeType]
    if (!magic) {
        return { isValid: false, error: 'Unknown file type' }
    }

    const fileHeader = buffer.slice(0, magic.length)
    if (!fileHeader.equals(magic)) {
        return { isValid: false, error: 'Invalid file content' }
    }

    return { isValid: true }
}

/**
 * Comprehensive file validation for image uploads
 */
export async function validateImageFile(
    file: File,
    options: {
        maxSize?: number
        allowedTypes?: readonly string[]
    } = {}
): Promise<FileValidationResult> {
    const {
        maxSize = MAX_FILE_SIZE,
        allowedTypes = ALLOWED_IMAGE_TYPES
    } = options

    // Validate MIME type
    const typeValidation = validateFileType(file.type, allowedTypes)
    if (!typeValidation.isValid) {
        return typeValidation
    }

    // Validate file size
    const sizeValidation = validateFileSize(file.size, maxSize)
    if (!sizeValidation.isValid) {
        return sizeValidation
    }

    // Validate magic bytes
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const magicValidation = validateFileMagicBytes(buffer, file.type)
    if (!magicValidation.isValid) {
        return magicValidation
    }

    return { isValid: true }
}

// ============================================================================
// SEARCH INPUT SANITIZATION
// ============================================================================

const SEARCH_SPECIAL_CHARS = /[<>{}\[\]\\|^~`]/g
const SEARCH_INJECTION_PATTERNS = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE|EXEC|EXECUTE)\b)/i,
    /(\b(OR\s+1\s*=\s*1|AND\s+1\s*=\s*1)\b)/i,
    /(--|#|\/\*|\*\/)/,
    /(\bWAITFOR\s+DELAY\b)/i,
    /(\bSLEEP\s*\()/i
]

/**
 * Sanitize search query input
 * - Remove special characters that could affect search
 * - Check for SQL injection patterns
 * - Limit length
 * - Normalize whitespace
 */
export function sanitizeSearchQuery(query: string, maxLength: number = 100): {
    sanitized: string
    isValid: boolean
    error?: string
} {
    if (!query || typeof query !== 'string') {
        return { sanitized: '', isValid: false, error: 'Search query is required' }
    }

    let sanitized = query.trim()

    // Check length
    if (sanitized.length > maxLength) {
        return {
            sanitized: '',
            isValid: false,
            error: `Search query too long (max ${maxLength} characters)`
        }
    }

    // Check for injection patterns
    for (const pattern of SEARCH_INJECTION_PATTERNS) {
        if (pattern.test(sanitized)) {
            return {
                sanitized: '',
                isValid: false,
                error: 'Invalid search query'
            }
        }
    }

    // Remove special characters
    sanitized = sanitized.replace(SEARCH_SPECIAL_CHARS, '')

    // Remove zero-width characters
    sanitized = removeZeroWidthChars(sanitized)

    // Normalize Unicode
    sanitized = normalizeUnicode(sanitized)

    // Check minimum length after sanitization
    if (sanitized.length < 2) {
        return {
            sanitized: '',
            isValid: false,
            error: 'Search query must be at least 2 characters'
        }
    }

    return { sanitized, isValid: true }
}

// ============================================================================
// JSON VALIDATION
// ============================================================================

const DANGEROUS_JSON_KEYS = ['__proto__', 'constructor', 'prototype']

/**
 * Safe JSON parsing with prototype pollution prevention
 */
export function safeJsonParse<T = unknown>(json: string): {
    success: boolean
    data?: T
    error?: string
} {
    try {
        // Check for dangerous keys before parsing
        for (const key of DANGEROUS_JSON_KEYS) {
            if (json.includes(`"${key}"`)) {
                return { success: false, error: 'Invalid JSON content' }
            }
        }

        const parsed = JSON.parse(json)

        // Recursively check for prototype pollution
        if (containsDangerousKeys(parsed)) {
            return { success: false, error: 'Invalid JSON structure' }
        }

        return { success: true, data: parsed as T }
    } catch (_) {
        return { success: false, error: 'Invalid JSON format' }
    }
}

function containsDangerousKeys(obj: unknown): boolean {
    if (obj === null || typeof obj !== 'object') {
        return false
    }

    for (const key of Object.keys(obj as object)) {
        if (DANGEROUS_JSON_KEYS.includes(key)) {
            return true
        }
        if (containsDangerousKeys((obj as Record<string, unknown>)[key])) {
            return true
        }
    }

    return false
}

/**
 * Validate social stats JSON structure
 */
export function validateSocialStats(stats: unknown): {
    isValid: boolean
    error?: string
} {
    if (typeof stats !== 'object' || stats === null) {
        return { isValid: false, error: 'Stats must be an object' }
    }

    const allowedPlatforms = ['instagram', 'tiktok', 'linkedin', 'twitter']
    const statsObj = stats as Record<string, unknown>

    for (const [key, value] of Object.entries(statsObj)) {
        // Check for dangerous keys
        if (DANGEROUS_JSON_KEYS.includes(key)) {
            return { isValid: false, error: 'Invalid stats key' }
        }

        // Validate platform name
        if (!allowedPlatforms.includes(key)) {
            return { isValid: false, error: `Invalid platform: ${key}` }
        }

        // Validate follower count
        if (typeof value !== 'number' || !Number.isInteger(value)) {
            return { isValid: false, error: `Invalid follower count for ${key}` }
        }

        if (value < 0 || value > 1000000000) {
            return { isValid: false, error: `Follower count out of range for ${key}` }
        }
    }

    return { isValid: true }
}

// ============================================================================
// STRING FIELD SANITIZATION
// ============================================================================

interface StringSanitizationOptions {
    maxLength?: number
    minLength?: number
    allowNewlines?: boolean
    allowHtml?: boolean
}

/**
 * Comprehensive string sanitization for user input
 */
export function sanitizeString(
    input: string,
    options: StringSanitizationOptions = {}
): {
    sanitized: string
    isValid: boolean
    error?: string
} {
    const {
        maxLength = 255,
        minLength = 1,
        allowNewlines = false,
        allowHtml = false
    } = options

    if (typeof input !== 'string') {
        return { sanitized: '', isValid: false, error: 'Input must be a string' }
    }

    let sanitized = input

    // Remove zero-width characters
    sanitized = removeZeroWidthChars(sanitized)

    // Normalize Unicode
    sanitized = normalizeUnicode(sanitized)

    // Normalize whitespace
    if (allowNewlines) {
        // Remove control chars
        sanitized = sanitized.replace(CONTROL_CHARS, '')
        // Normalize spaces (preserve newlines)
        sanitized = sanitized.replace(/[ \t]+/g, ' ')
        // Trim
        sanitized = sanitized.trim()
    } else {
        // Normalize whitespace (collapses everything including newlines to space)
        sanitized = normalizeWhitespace(sanitized)
    }

    // Handle newlines
    if (!allowNewlines) {
        sanitized = sanitized.replace(/\n/g, ' ').replace(/\r/g, '')
    }

    // Sanitize HTML if not allowed
    if (!allowHtml) {
        sanitized = DOMPurify.sanitize(sanitized, { ALLOWED_TAGS: [] })
    }

    // Check minimum length
    if (sanitized.length < minLength) {
        return {
            sanitized: '',
            isValid: false,
            error: `Input must be at least ${minLength} characters`
        }
    }

    // Check maximum length
    if (sanitized.length > maxLength) {
        return {
            sanitized: '',
            isValid: false,
            error: `Input must be no more than ${maxLength} characters`
        }
    }

    return { sanitized, isValid: true }
}

/**
 * Sanitize name fields with specific rules
 */
export function sanitizeName(name: string, maxLength: number = 100): {
    sanitized: string
    isValid: boolean
    error?: string
} {
    // Remove characters not suitable for names
    let sanitized = name
        .replace(ZERO_WIDTH_CHARS, '')
        .normalize('NFKC')
        .replace(CONTROL_CHARS, '')
        .replace(/[<>"'&]/g, '') // Remove HTML-special chars
        .trim()

    // Replace multiple spaces with single space
    sanitized = sanitized.replace(/\s+/g, ' ')

    // Check for valid name pattern (letters, spaces, hyphens, apostrophes)
    const validNamePattern = /^[\p{L}\s\-'\.]+$/u
    if (!validNamePattern.test(sanitized)) {
        return {
            sanitized: '',
            isValid: false,
            error: 'Name contains invalid characters'
        }
    }

    if (sanitized.length < 2) {
        return {
            sanitized: '',
            isValid: false,
            error: 'Name must be at least 2 characters'
        }
    }

    if (sanitized.length > maxLength) {
        return {
            sanitized: '',
            isValid: false,
            error: `Name must be no more than ${maxLength} characters`
        }
    }

    return { sanitized, isValid: true }
}

/**
 * Sanitize bio/description fields
 */
export function sanitizeBio(bio: string, maxLength: number = 1000): {
    sanitized: string
    isValid: boolean
    error?: string
} {
    return sanitizeString(bio, {
        maxLength,
        minLength: 0,
        allowNewlines: true,
        allowHtml: false
    })
}

// ============================================================================
// SQL INJECTION PREVENTION
// ============================================================================

const SQL_KEYWORDS = [
    'SELECT', 'INSERT', 'UPDATE', 'DELETE', 'DROP', 'CREATE', 'ALTER',
    'TRUNCATE', 'EXEC', 'EXECUTE', 'UNION', 'INTERSECT', 'EXCEPT',
    'DECLARE', 'CAST', 'CONVERT', 'TABLE', 'DATABASE'
]

const SQL_PATTERN = new RegExp(
    `\\b(${SQL_KEYWORDS.join('|')})\\b`,
    'i'
)

/**
 * Check if input contains potential SQL injection patterns
 * Note: This is a defense-in-depth measure. Prisma's parameterized queries
 * already provide strong protection against SQL injection.
 */
export function containsSqlInjection(input: string): boolean {
    if (typeof input !== 'string') {
        return false
    }

    // Check for SQL keywords combined with suspicious characters
    const suspiciousPatterns = [
        /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE)\b.*['";])/i,
        /(['";].*\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE)\b)/i,
        /(--|#|\/\*|\*\/)/,
        /(\bOR\b|\bAND\b)\s*['"0-9]/i,
        /(\bWAITFOR\s+DELAY\b|\bSLEEP\s*\()/i,
        /(\bEXEC\s*\(|\bEXECUTE\s*\()/i,
        /(\bxp_|\bsp_)/i // Extended/Stored procedures
    ]

    return suspiciousPatterns.some(pattern => pattern.test(input))
}

/**
 * Sanitize input for use in raw SQL queries
 * Only use when absolutely necessary - prefer Prisma's query builder
 */
export function sanitizeForSql(input: string): string {
    if (typeof input !== 'string') {
        return ''
    }

    // Remove null bytes
    let sanitized = input.replace(/\x00/g, '')

    // Remove control characters
    sanitized = sanitized.replace(CONTROL_CHARS, '')

    // Remove zero-width characters
    sanitized = removeZeroWidthChars(sanitized)

    // Normalize Unicode
    sanitized = normalizeUnicode(sanitized)

    // Escape single quotes (defense in depth)
    sanitized = sanitized.replace(/'/g, "''")

    return sanitized
}

/**
 * Sanitize input for use in Prisma parameterized queries.
 * Does NOT escape quotes, as Prisma handles parameterization.
 */
export function sanitizeForPrisma(input: string): string {
    if (typeof input !== 'string') {
        return ''
    }

    // Remove null bytes
    let sanitized = input.replace(/\x00/g, '')

    // Remove control characters
    sanitized = sanitized.replace(CONTROL_CHARS, '')

    // Remove zero-width characters
    sanitized = removeZeroWidthChars(sanitized)

    // Normalize Unicode
    sanitized = normalizeUnicode(sanitized)

    return sanitized
}

// ============================================================================
// SLUG GENERATION
// ============================================================================

/**
 * Generate a URL-safe slug from a string
 */
export function generateSlug(input: string): string {
    return input
        .normalize('NFKD')
        .replace(/[^\w\s-]/g, '')
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .substring(0, 100)
}

// ============================================================================
// COMBINED SANITIZATION
// ============================================================================

/**
 * Apply all standard sanitizations to a string
 * Use this for most text inputs
 */
export function comprehensiveSanitize(input: string, options: StringSanitizationOptions = {}): string {
    const result = sanitizeString(input, options)
    return result.isValid ? result.sanitized : ''
}

/**
 * Sanitize HTML content with DOMPurify
 * Use for rich text/WYSIWYG content
 */
export function sanitizeHtmlContent(html: string): string {
    return DOMPurify.sanitize(html, {
        ALLOWED_TAGS: [
            'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'strike',
            'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
            'ul', 'ol', 'li',
            'a', 'img',
            'blockquote', 'code', 'pre',
            'table', 'thead', 'tbody', 'tr', 'td', 'th'
        ],
        ALLOWED_ATTR: [
            'href', 'title', 'alt', 'src', 'target',
            'class', 'id', 'width', 'height'
        ],
        ALLOW_DATA_ATTR: false,
        FORBID_ATTR: ['style', 'onerror', 'onload', 'onclick'],
        FORBID_TAGS: ['script', 'style', 'iframe', 'form', 'input', 'textarea']
    })
}
