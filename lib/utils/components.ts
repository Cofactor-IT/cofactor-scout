/**
 * Component Utility Functions
 * 
 * Helper functions for common component operations including
 * date formatting, text truncation, and user display names.
 */

/**
 * Get user initials from name
 * 
 * @param user - User object with name fields
 * @returns Two-character initials
 */
export function getInitials(user: {
  preferredName?: string | null
  firstName: string
  lastName: string
}): string {
  if (user.preferredName) {
    return user.preferredName.substring(0, 2).toUpperCase()
  }
  const first = user.firstName.charAt(0)
  const last = user.lastName.charAt(0) || ''
  return (first + last).toUpperCase()
}

/**
 * Format date for display
 * 
 * @param date - Date to format
 * @param format - Display format (short or long)
 * @returns Formatted date string
 */
export function formatDate(date: Date | string | null, format: 'short' | 'long' = 'short'): string {
  if (!date) return '-'
  
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  if (format === 'long') {
    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }).format(dateObj)
  }
  
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(dateObj)
}

/**
 * Format relative time (e.g., "2 hours ago")
 * 
 * @param date - Date to format
 * @returns Relative time string
 */
export function formatRelativeTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffMs = now.getTime() - dateObj.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)

  if (diffSec < 60) return 'just now'
  if (diffMin < 60) return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`
  if (diffHour < 24) return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`
  if (diffDay < 7) return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`
  
  return formatDate(dateObj)
}

/**
 * Truncate text with ellipsis
 * 
 * @param text - Text to truncate
 * @param maxLength - Maximum length before truncation
 * @returns Truncated text with ellipsis if needed
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength - 3) + '...'
}

/**
 * Format number with commas
 * 
 * @param num - Number to format
 * @returns Formatted number string
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num)
}

/**
 * Safe navigation - returns /not-found for invalid routes
 * 
 * @param router - Next.js router instance
 * @param path - Path to navigate to
 */
export function safeNavigate(router: any, path: string) {
  try {
    router.push(path)
  } catch (error) {
    router.push('/not-found')
  }
}
