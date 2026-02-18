import { prisma } from '@/lib/database/prisma'
import { sendMentionEmail } from '@/lib/email/send'
import { logger } from '@/lib/logger'

/**
 * Extract mentioned names from content
 * Looks for @Name pattern
 */
export function extractMentions(content: string): string[] {
    // Regex to find @Name patterns
    // Matches @ followed by word characters, allowing for potential spaces if we want to support "@John Doe" later, 
    // but for now let's stick to simple @Name or @NameName to match typical username/slug patterns if possible, 
    // or just @Name for simplicity as per plan.
    // Let's go with a robust one that catches @Word
    const mentionRegex = /@(\w+)/g
    const matches = content.match(mentionRegex)

    if (!matches) return []

    // Return unique names without the @
    return Array.from(new Set(matches.map(m => m.slice(1))))
}

/**
 * Process mentions in content and send emails
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
