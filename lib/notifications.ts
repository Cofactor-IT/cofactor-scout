/**
 * DEPRECATED: Notification model has been removed
 */
export async function createNotification() {
    return null
}

export async function createManyNotifications() {
    return { count: 0 }
}

export async function getUserNotifications() {
    return { notifications: [], total: 0, unread: 0 }
}

export async function markAsRead() {
    return
}

export async function markAllAsRead() {
    return
}

export async function getNotificationPreferences() {
    return null
}

export async function updateNotificationPreferences() {
    return null
}
