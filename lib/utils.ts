import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function ensureAbsoluteUrl(url: string | null | undefined) {
    if (!url) return undefined
    if (url.startsWith('http://') || url.startsWith('https://')) return url
    return `https://${url}`
}

/**
 * Generate a URL-safe slug from a string
 */
export function generateSlug(input: string): string {
    return input
        .normalize('NFKD')               // Normalize unicode characters
        .toLowerCase()                  // Convert to lowercase
        .trim()                         // Trim whitespace
        .replace(/[^\w\s-]/g, '')       // Remove special chars
        .replace(/[\s_-]+/g, '-')       // Replace spaces and underscores with dashes
        .replace(/-+/g, '-')            // Collapse multiple dashes
        .replace(/^-+|-+$/g, '')        // Remove leading/trailing dashes
        .substring(0, 100)              // Limit length
}
