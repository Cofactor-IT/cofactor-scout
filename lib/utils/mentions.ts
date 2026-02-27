/**
 * Mentions Utilities
 * 
 * Functions for extracting @mentions from content and sending notification emails.
 */
import { prisma } from '@/lib/database/prisma'
import { sendMentionEmail } from '@/lib/email/send'
import { logger } from '@/lib/logger'

/**
 * Extract mentioned names from content
 * 
 * @param content - Text content to scan for @mentions
 * @returns Array of unique mentioned names (without @ prefix)
 */
export function extractMentions(content: string): string[] {
    // Match @Word pattern
    const mentionRegex = /@(\w+)/g
    const matches = content.match(mentionRegex)

    if (!matches) return []

    // Return unique names without the @
    return Array.from(new Set(matches.map(m => m.slice(1))))
}

/**
 * Process mentions in content and send notification emails
 * 
 * @param content - Content containing @mentions
 * @param link - Link to the content
 * @param actorName - Name of user who created the mention
 * @param contextSummary - Brief description of where mention occurred
 */
export async function processMentions(
    content: string,
    link: string,
    actorName: string,
    contextSummary: string
): Promise<void> {
    const mentionedNames = extractMentions(content)

    if (mentionedNames.length === 0) return

    logger.info('Processing mentions', { count: mentionedNames.length, names: mentionedNames })

    const users = await prisma.user.findMany({
        where: {
            OR: [
                { preferredName: { in: mentionedNames, mode: 'insensitive' } },
                { firstName: { in: mentionedNames, mode: 'insensitive' } },
                { fullName: { in: mentionedNames, mode: 'insensitive' } },
            ],
        },
        select: {
            id: true,
            email: true,
            preferredName: true,
            firstName: true,
            fullName: true,
        }
    })

    // Send emails in parallel
    await Promise.all(users.map(async (user) => {
        const displayName = user.preferredName || user.firstName || user.fullName
        if (!user.email || !displayName) return

        try {
            await sendMentionEmail(
                user.email,
                displayName,
                actorName,
                contextSummary,
                link
            )
            logger.info('Mention email sent', { userId: user.id, name: displayName })
        } catch (error) {
            logger.error('Failed to send mention email', { userId: user.id }, error as Error)
        }
    }))
}
