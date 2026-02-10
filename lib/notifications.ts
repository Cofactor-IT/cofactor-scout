import { prisma } from '@/lib/prisma'
import { NotificationType, Notification, NotificationPreference } from '@prisma/client'

export async function createNotification(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    link?: string
): Promise<Notification> {
    return prisma.notification.create({
        data: {
            userId,
            type,
            title,
            message,
            link,
            read: false
        }
    })
}

export async function createBulkNotifications(
    notifications: Array<{
        userId: string
        type: NotificationType
        title: string
        message: string
        link?: string
    }>
): Promise<{ count: number }> {
    return prisma.notification.createMany({
        data: notifications
    })
}

export async function getUserNotifications(
    userId: string,
    page: number = 1,
    limit: number = 20
): Promise<{ notifications: Notification[]; total: number; unread: number }> {
    const [notifications, total, unread] = await Promise.all([
        prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: limit,
            skip: (page - 1) * limit
        }),
        prisma.notification.count({ where: { userId } }),
        prisma.notification.count({ where: { userId, read: false } })
    ])

    return { notifications, total, unread }
}

export async function markAsRead(notificationId: string): Promise<void> {
    await prisma.notification.update({
        where: { id: notificationId },
        data: { read: true }
    })
}

export async function markAllAsRead(userId: string): Promise<void> {
    await prisma.notification.updateMany({
        where: { userId },
        data: { read: true }
    })
}

export async function getNotificationPreferences(
    userId: string
): Promise<NotificationPreference> {
    const preferences = await prisma.notificationPreference.findUnique({
        where: { userId }
    })

    if (preferences) {
        return preferences
    }

    return {
        id: '',
        userId,
        emailEnabled: true,
        pushEnabled: false,
        inAppEnabled: true,
        wikiApproval: true,
        staffStatus: true,
        activityFeed: true,
        createdAt: new Date(),
        updatedAt: new Date()
    }
}

export async function updateNotificationPreferences(
    userId: string,
    preferences: Partial<NotificationPreference>
): Promise<NotificationPreference> {
    return prisma.notificationPreference.upsert({
        where: { userId },
        create: { userId, ...preferences },
        update: { ...preferences }
    })
}

export async function sendEmailNotification(
    userId: string,
    notification: Notification
): Promise<void> {
    const { sendNotificationEmail } = await import('@/lib/email')
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true, name: true }
    })

    if (user?.email) {
        await sendNotificationEmail(
            user.email,
            user.name || 'User',
            notification.title,
            notification.message,
            notification.link || undefined
        )
    }
}

export async function shouldSendNotification(
    userId: string,
    type: NotificationType
): Promise<boolean> {
    const preferences = await getNotificationPreferences(userId)

    if (!preferences.inAppEnabled) return false

    switch (type) {
        case 'WIKI_APPROVED':
            return preferences.wikiApproval
        case 'WIKI_REJECTED':
            return preferences.wikiApproval
        case 'WIKI_PUBLISHED':
            return preferences.wikiApproval
        case 'STAFF_APPROVED':
            return preferences.staffStatus
        case 'STAFF_REJECTED':
            return preferences.staffStatus
        case 'REFERRAL_USED':
            return preferences.inAppEnabled
        case 'POWER_SCORE_UPDATED':
            return preferences.inAppEnabled
        case 'USER_FOLLOWED':
            return preferences.activityFeed
        case 'MENTION':
            return preferences.activityFeed
        case 'COMMENT':
            return preferences.activityFeed
        default:
            return true
    }
}
