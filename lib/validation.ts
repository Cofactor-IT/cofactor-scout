import { z } from 'zod'

/**
 * Validation schemas for form inputs
 */

export const signUpSchema = z.object({
    email: z.string()
        .min(1, 'Email is required')
        .email('Invalid email address')
        .max(255, 'Email is too long')
        .toLowerCase()
        .trim(),
    password: z.string()
        .min(8, 'Password must be at least 8 characters')
        .max(128, 'Password is too long'),
    name: z.string()
        .min(1, 'Name is required')
        .max(100, 'Name is too long')
        .trim()
        .refine(name => name.length >= 2, 'Name must be at least 2 characters'),
    referralCode: z.string()
        .min(1, 'Referral code is required')
        .max(50, 'Referral code is too long')
        .trim()
})

export const signInSchema = z.object({
    email: z.string()
        .min(1, 'Email is required')
        .email('Invalid email address')
        .toLowerCase()
        .trim(),
    password: z.string()
        .min(1, 'Password is required')
})

export const wikiSubmissionSchema = z.object({
    title: z.string()
        .min(1, 'Title is required')
        .max(200, 'Title is too long')
        .trim(),
    content: z.string()
        .min(50, 'Content must be at least 50 characters')
        .max(100000, 'Content is too long')
        .trim()
})

export const socialConnectSchema = z.object({
    platform: z.enum(['instagram', 'tiktok', 'linkedin'], {
        message: 'Invalid platform'
    }),
    username: z.string()
        .min(1, 'Username is required')
        .max(100, 'Username is too long')
        .trim(),
    followers: z.string()
        .optional()
        .transform(val => val ? parseInt(val, 10) : 0)
        .pipe(z.number().min(0).max(1000000000, 'Follower count seems invalid'))
})

export type SignUpInput = z.infer<typeof signUpSchema>
export type SignInInput = z.infer<typeof signInSchema>
export type WikiSubmissionInput = z.infer<typeof wikiSubmissionSchema>
export type SocialConnectInput = z.infer<typeof socialConnectSchema>
