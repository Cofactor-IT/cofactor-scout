'use server'

/**
 * DEPRECATED: This file contained trusted user management
 * The isTrusted field has been removed from the User model
 * 
 * TODO: Implement new member management actions if needed
 */

export async function toggleTrustedStatus() {
    throw new Error('Trusted user system has been removed.')
}
