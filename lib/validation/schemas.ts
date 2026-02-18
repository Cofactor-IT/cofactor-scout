import { z } from 'zod'
import {
    validateAndSanitizeUrl,
    validateSocialUrl,
    sanitizeSearchQuery,
    sanitizeName,
    sanitizeBio,
    sanitizeString,
    safeJsonParse,
    validateSocialStats,
    containsSqlInjection,
    MAX_FILE_SIZE,
    MAX_AVATAR_SIZE,
    ALLOWED_IMAGE_TYPES
} from '@/lib/security/sanitization'

/**
 * Enhanced validation schemas with comprehensive sanitization
 */

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Create a Zod schema with SQL injection check
 */
function sqlSafeString(message: string = 'Input contains invalid characters') {
    return z.string().refine(
        (val) => !containsSqlInjection(val),
        { message }
    )
}

// ============================================================================
// AUTHENTICATION SCHEMAS (Enhanced)
// ============================================================================

export const signUpSchema = z.object({
    email: z.string()
        .min(1, 'Email is required')
        .email('Invalid email address')
        .max(255, 'Email is too long')
        .toLowerCase()
        .trim()
        .refine(
            (email) => !containsSqlInjection(email),
            'Invalid email format'
        ),
    password: z.string()
        .min(8, 'Password must be at least 8 characters')
        .max(128, 'Password is too long')
        .refine(
            (password) => /[A-Z]/.test(password),
            'Password must contain at least one uppercase letter'
        )
        .refine(
            (password) => /[a-z]/.test(password),
            'Password must contain at least one lowercase letter'
        )
        .refine(
            (password) => /[0-9]/.test(password),
            'Password must contain at least one number'
        )
        .refine(
            (password) => /[^A-Za-z0-9]/.test(password),
            'Password must contain at least one special character'
        ),
    name: z.string()
        .min(2, 'Name must be at least 2 characters')
        .max(100, 'Name is too long')
        .trim()
        .transform((name, ctx) => {
            const result = sanitizeName(name)
            if (!result.isValid) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: result.error
                })
                return z.NEVER
            }
            return result.sanitized
        }),
})


export const signInSchema = z.object({
    email: z.string()
        .min(1, 'Email is required')
        .email('Invalid email address')
        .toLowerCase()
        .trim(),
    password: z.string()
        .min(1, 'Password is required')
        .max(128, 'Password is too long')
})

// ============================================================================
// WIKI SUBMISSION SCHEMA (Enhanced)
// ============================================================================

export const wikiSubmissionSchema = z.object({
    title: z.string()
        .min(1, 'Title is required')
        .max(200, 'Title is too long')
        .trim()
        .transform((title, ctx) => {
            const result = sanitizeString(title, {
                maxLength: 200,
                minLength: 1,
                allowNewlines: false,
                allowHtml: false
            })
            if (!result.isValid) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: result.error
                })
                return z.NEVER
            }
            return result.sanitized
        }),
    content: z.string()
        .min(1, 'Content is required')
        .max(100000, 'Content is too long')
        .trim()
})

export const wikiSlugSchema = z.string()
    .min(1, 'Slug is required')
    .max(100, 'Slug is too long')
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens')
    .transform((slug) => slug.toLowerCase().trim())

// ============================================================================
// SOCIAL MEDIA CONNECTION SCHEMAS (Enhanced)
// ============================================================================

export const socialConnectSchema = z.object({
    platform: z.enum(['instagram', 'tiktok', 'linkedin'], {
        message: 'Invalid platform'
    }),
    username: z.string()
        .min(1, 'Username is required')
        .max(100, 'Username is too long')
        .trim()
        .transform((username, ctx) => {
            // Remove @ symbol if present
            const clean = username.replace(/^@/, '')
            const result = sanitizeString(clean, {
                maxLength: 100,
                minLength: 1,
                allowNewlines: false,
                allowHtml: false
            })
            if (!result.isValid) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: result.error
                })
                return z.NEVER
            }
            return result.sanitized
        }),
    followers: z.union([
        z.string().optional().transform(val => val ? parseInt(val, 10) : 0),
        z.number().optional().default(0)
    ]).pipe(z.number().min(0).max(1000000000, 'Follower count seems invalid'))
})

// ============================================================================
// URL VALIDATION SCHEMAS
// ============================================================================

/**
 * Generic URL validation schema
 */
export const urlSchema = z.string()
    .max(2048, 'URL is too long')
    .transform((url, ctx) => {
        const result = validateAndSanitizeUrl(url)
        if (!result.isValid) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: result.error
            })
            return z.NEVER
        }
        return result.sanitizedUrl
    })
    .nullable()
    .optional()

/**
 * LinkedIn URL validation
 */
export const linkedinUrlSchema = z.string()
    .max(2048, 'LinkedIn URL is too long')
    .transform((url, ctx) => {
        if (!url || url.trim() === '') return null
        const result = validateSocialUrl(url.trim(), 'linkedin')
        if (!result.isValid) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: result.error || 'Invalid LinkedIn URL'
            })
            return z.NEVER
        }
        return result.sanitizedUrl
    })
    .nullable()
    .optional()

/**
 * Twitter/X URL validation
 */
export const twitterUrlSchema = z.string()
    .max(2048, 'Twitter URL is too long')
    .transform((url, ctx) => {
        if (!url || url.trim() === '') return null
        const result = validateSocialUrl(url.trim(), 'twitter')
        if (!result.isValid) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: result.error || 'Invalid Twitter URL'
            })
            return z.NEVER
        }
        return result.sanitizedUrl
    })
    .nullable()
    .optional()

/**
 * Personal website URL validation
 */
export const websiteUrlSchema = z.string()
    .max(2048, 'Website URL is too long')
    .transform((url, ctx) => {
        if (!url || url.trim() === '') return null
        const result = validateAndSanitizeUrl(url.trim())
        if (!result.isValid) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: result.error || 'Invalid website URL'
            })
            return z.NEVER
        }
        return result.sanitizedUrl
    })
    .nullable()
    .optional()

/**
 * Google Scholar URL validation
 */
export const googleScholarUrlSchema = z.string()
    .max(2048, 'Google Scholar URL is too long')
    .transform((url, ctx) => {
        if (!url || url.trim() === '') return null
        const result = validateSocialUrl(url.trim(), 'googleScholar')
        if (!result.isValid) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: result.error || 'Invalid Google Scholar URL'
            })
            return z.NEVER
        }
        return result.sanitizedUrl
    })
    .nullable()
    .optional()

/**
 * ResearchGate URL validation
 */
export const researchGateUrlSchema = z.string()
    .max(2048, 'ResearchGate URL is too long')
    .transform((url, ctx) => {
        if (!url || url.trim() === '') return null
        const result = validateSocialUrl(url.trim(), 'researchGate')
        if (!result.isValid) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: result.error || 'Invalid ResearchGate URL'
            })
            return z.NEVER
        }
        return result.sanitizedUrl
    })
    .nullable()
    .optional()

// Combined social URLs schema for profile updates
export const socialUrlsSchema = z.object({
    linkedin: linkedinUrlSchema,
    twitter: twitterUrlSchema,
    website: websiteUrlSchema,
    googleScholar: googleScholarUrlSchema,
    researchGate: researchGateUrlSchema
})

// ============================================================================
// FILE UPLOAD SCHEMAS
// ============================================================================

/**
 * File metadata validation schema (for API routes)
 */
export const fileUploadSchema = z.object({
    name: z.string()
        .min(1, 'Filename is required')
        .max(255, 'Filename is too long')
        .refine(
            (name) => !containsSqlInjection(name),
            'Invalid filename'
        ),
    type: z.enum(['image/jpeg', 'image/png', 'image/webp'], {
        message: 'Invalid file type. Allowed: JPEG, PNG, WEBP'
    }),
    size: z.number()
        .max(MAX_FILE_SIZE, `File too large. Maximum size: ${MAX_FILE_SIZE / 1024 / 1024}MB`)
        .min(1, 'File cannot be empty')
})

/**
 * Avatar upload schema (smaller size limit)
 */
export const avatarUploadSchema = fileUploadSchema.extend({
    size: z.number()
        .max(MAX_AVATAR_SIZE, `Avatar too large. Maximum size: ${MAX_AVATAR_SIZE / 1024 / 1024}MB`)
        .min(1, 'File cannot be empty')
})

/**
 * Wiki image upload schema
 */
export const wikiImageUploadSchema = fileUploadSchema

// ============================================================================
// SEARCH QUERY SCHEMAS
// ============================================================================

/**
 * Search query validation schema
 */
export const searchQuerySchema = z.string()
    .max(100, 'Search query is too long')
    .transform((query, ctx) => {
        const result = sanitizeSearchQuery(query, 100)
        if (!result.isValid) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: result.error
            })
            return z.NEVER
        }
        return result.sanitized
    })

/**
 * Search filters schema
 */
export const searchFiltersSchema = z.object({
    type: z.enum(['page', 'institute', 'lab', 'person']).optional(),
    universityId: z.string().cuid().optional(),
    page: z.number().int().min(1).default(1),
    limit: z.number().int().min(1).max(50).default(20)
})

// ============================================================================
// JSON DATA SCHEMAS
// ============================================================================

/**
 * Safe JSON string schema with prototype pollution protection
 */
export const safeJsonStringSchema = z.string()
    .max(10000, 'JSON data is too large')
    .transform((json, ctx) => {
        const result = safeJsonParse(json)
        if (!result.success) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: result.error
            })
            return z.NEVER
        }
        return result.data
    })

/**
 * Social stats JSON schema
 */


/**
 * Custom field values schema
 */
export const customFieldValueSchema = z.object({
    fieldId: z.string().cuid(),
    value: z.union([
        z.string().max(5000),
        z.number(),
        z.boolean(),
        z.array(z.string().max(1000)).max(50)
    ])
})

export const customFieldValuesSchema = z.array(customFieldValueSchema)
    .max(100, 'Too many custom field values')

// ============================================================================
// STRING FIELD SCHEMAS
// ============================================================================

/**
 * Name field schema with enhanced sanitization
 */
export const nameFieldSchema = z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name is too long')
    .transform((name, ctx) => {
        const result = sanitizeName(name, 100)
        if (!result.isValid) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: result.error
            })
            return z.NEVER
        }
        return result.sanitized
    })

/**
 * Bio field schema with enhanced sanitization
 */
export const bioFieldSchema = z.string()
    .max(1000, 'Bio is too long')
    .transform((bio, ctx) => {
        if (!bio || bio.trim() === '') return null
        const result = sanitizeBio(bio, 1000)
        if (!result.isValid) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: result.error
            })
            return z.NEVER
        }
        return result.sanitized
    })
    .nullable()
    .optional()

/**
 * Role/Position field schema
 */
export const roleFieldSchema = z.string()
    .max(100, 'Role is too long')
    .transform((role, ctx) => {
        if (!role || role.trim() === '') return null
        const result = sanitizeString(role, {
            maxLength: 100,
            minLength: 0,
            allowNewlines: false,
            allowHtml: false
        })
        if (!result.isValid) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: result.error
            })
            return z.NEVER
        }
        return result.sanitized
    })
    .nullable()
    .optional()

/**
 * Field of study schema
 */
export const fieldOfStudySchema = z.string()
    .max(200, 'Field of study is too long')
    .transform((field, ctx) => {
        if (!field || field.trim() === '') return null
        const result = sanitizeString(field, {
            maxLength: 200,
            minLength: 0,
            allowNewlines: false,
            allowHtml: false
        })
        if (!result.isValid) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: result.error
            })
            return z.NEVER
        }
        return result.sanitized
    })
    .nullable()
    .optional()

// ============================================================================
// PROFILE UPDATE SCHEMAS
// ============================================================================

/**
 * Profile update schema
 */
export const profileUpdateSchema = z.object({
    name: nameFieldSchema,
    bio: bioFieldSchema
})

/**
 * Public profile update schema
 */


// ============================================================================
// PERSON SCHEMAS
// ============================================================================

/**
 * Person creation/update schema
 */
export const personSchema = z.object({
    name: nameFieldSchema,
    role: roleFieldSchema,
    fieldOfStudy: fieldOfStudySchema,
    bio: bioFieldSchema,
    linkedin: linkedinUrlSchema,
    twitter: twitterUrlSchema,
    website: websiteUrlSchema,
    instituteId: z.string().cuid().nullable().optional(),
    labId: z.string().cuid().nullable().optional()
})

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type SignUpInput = z.infer<typeof signUpSchema>
export type SignInInput = z.infer<typeof signInSchema>
export type WikiSubmissionInput = z.infer<typeof wikiSubmissionSchema>
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>
export type PersonInput = z.infer<typeof personSchema>
export type SearchFiltersInput = z.infer<typeof searchFiltersSchema>
export type FileUploadInput = z.infer<typeof fileUploadSchema>
export type CustomFieldValueInput = z.infer<typeof customFieldValueSchema>
