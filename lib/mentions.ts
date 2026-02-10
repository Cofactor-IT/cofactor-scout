import { prisma } from '@/lib/prisma'
import { sendMentionEmail } from '@/lib/email'
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

    // Find users matching these names
    // This assumes users have a 'name' field that matches exactly, or a 'slug' equivalent.
    // Since we don't have usernames, we'll search by name.
    // This might be fuzzy, but it's a start.
    const users = await prisma.user.findMany({
        where: {
            name: {
                in: mentionedNames,
                mode: 'insensitive' // Case insensitive match
            }
        },
        select: {
            id: true,
            email: true,
            name: true
        }
    })

    // Send emails in parallel
    await Promise.all(users.map(async (user) => {
        if (!user.email || !user.name) return

        try {
            await sendMentionEmail(
                user.email,
                user.name,
                actorName,
                contextSummary,
                link
            )
            logger.info('Mention email sent', { userId: user.id, name: user.name })
        } catch (error) {
            logger.error('Failed to send mention email', { userId: user.id }, error as Error)
        }
    }))
}
