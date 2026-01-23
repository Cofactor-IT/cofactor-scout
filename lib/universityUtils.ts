

import { prisma } from '@/lib/prisma'

/**
 * Personal email domains that should prompt user to use university email
 */
export const PERSONAL_EMAIL_DOMAINS = [
    'gmail.com',
    'googlemail.com',
    'icloud.com',
    'me.com',
    'mac.com',
    'hotmail.com',
    'outlook.com',
    'outlook.de',
    'live.com',
    'live.de',
    'yahoo.com',
    'yahoo.de',
    'protonmail.com',
    'proton.me',
    'aol.com',
    'gmx.de',
    'gmx.net',
    'gmx.com',
    'web.de',
    'mail.com',
    't-online.de',
    'freenet.de',
    'posteo.de',
    'mailbox.org'
]

/**
 * Extract email domain from an email address
 */
export function extractEmailDomain(email: string): string {
    const parts = email.toLowerCase().trim().split('@')
    return parts.length === 2 ? parts[1] : ''
}

/**
 * Check if email is from a personal email provider
 */
export function isPersonalEmail(email: string): boolean {
    const domain = extractEmailDomain(email)
    return PERSONAL_EMAIL_DOMAINS.includes(domain)
}

/**
 * Find university by email domain
 */
export async function findUniversityByDomain(domain: string) {
    if (!domain) return null

    const university = await prisma.university.findFirst({
        where: {
            domains: {
                has: domain.toLowerCase()
            },
            approved: true
        }
    })

    return university
}

/**
 * Find university by email address
 */
export async function findUniversityByEmail(email: string) {
    const domain = extractEmailDomain(email)
    return findUniversityByDomain(domain)
}

/**
 * Create a pending university (user-suggested)
 */
export async function createPendingUniversity(name: string, domain: string) {
    return prisma.university.create({
        data: {
            name: name.trim(),
            domains: [domain.toLowerCase()],
            approved: false
        }
    })
}
