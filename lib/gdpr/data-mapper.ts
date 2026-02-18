/**
 * GDPR Data Mapper
 * Documents all user data relationships for compliance and data export
 */

export interface DataRelationship {
    entity: string
    description: string
    fields: string[]
    sensitive: boolean
    retention: string
    purpose: string
    legalBasis: 'consent' | 'contract' | 'legal_obligation' | 'legitimate_interest'
}

export interface UserDataMap {
    profile: DataRelationship
    authentication: DataRelationship
    activity: DataRelationship
    preferences: DataRelationship

    generatedContent: DataRelationship
    system: DataRelationship
}

export const userDataMap: UserDataMap = {
    profile: {
        entity: 'User Profile',
        description: 'Basic profile information provided during registration',
        fields: ['id', 'email', 'name', 'bio', 'createdAt', 'updatedAt'],
        sensitive: true,
        retention: 'Until account deletion',
        purpose: 'User identification and communication',
        legalBasis: 'contract'
    },
    authentication: {
        entity: 'Authentication Data',
        description: 'Credentials and security-related data',
        fields: ['password', 'emailVerified', 'verificationToken', 'verificationExpires', 'failedLoginAttempts', 'lockedUntil'],
        sensitive: true,
        retention: 'Until account deletion',
        purpose: 'Account security and access control',
        legalBasis: 'contract'
    },
    activity: {
        entity: 'User Activity',
        description: 'Records of user actions and engagement',
        fields: ['role'],
        sensitive: false,
        retention: 'Until account deletion',
        purpose: 'Gamification and platform engagement',
        legalBasis: 'legitimate_interest'
    },
    preferences: {
        entity: 'User Preferences',
        description: 'Settings and notification preferences',
        fields: ['notificationPreference', 'userPreference'],
        sensitive: false,
        retention: 'Until account deletion',
        purpose: 'Personalizing user experience',
        legalBasis: 'consent'
    },
    generatedContent: {
        entity: 'User Generated Content',
        description: 'Content created by the user',
        fields: ['revisions', 'pageVersions', 'bookmarks', 'customFieldValues'],
        sensitive: false,
        retention: 'Indefinite (anonymized after deletion)',
        purpose: 'Platform content and collaboration',
        legalBasis: 'contract'
    },
    system: {
        entity: 'System Data',
        description: 'Internal system records',
        fields: ['notifications', 'passwordResetTokens', 'exportJobs', 'importJobs', 'experimentAssignments', 'calendarEvents', 'secondaryUniversityRequests'],
        sensitive: false,
        retention: '30 days to 1 year depending on type',
        purpose: 'Platform operations and user support',
        legalBasis: 'legitimate_interest'
    }
}

export const relatedEntities = [
    {
        name: 'WikiRevision',
        relation: 'authorId -> User.id',
        description: 'Wiki page edits and contributions',
        anonymizationStrategy: 'keep_content_anonymize_author'
    },

    {
        name: 'Notification',
        relation: 'userId -> User.id',
        description: 'User notifications and alerts',
        anonymizationStrategy: 'delete'
    },
    {
        name: 'Bookmark',
        relation: 'userId -> User.id',
        description: 'User bookmarked wiki pages',
        anonymizationStrategy: 'delete'
    },
    {
        name: 'PageVersion',
        relation: 'createdBy -> User.id',
        description: 'Wiki page version history',
        anonymizationStrategy: 'keep_content_anonymize_author'
    },
    {
        name: 'CalendarEvent',
        relation: 'userId -> User.id',
        description: 'User calendar events',
        anonymizationStrategy: 'delete'
    },
    {
        name: 'CustomFieldValue',
        relation: 'userId -> User.id',
        description: 'Custom profile field values',
        anonymizationStrategy: 'delete'
    },
    {
        name: 'ExperimentAssignment',
        relation: 'userId -> User.id',
        description: 'A/B test assignments',
        anonymizationStrategy: 'delete'
    },
    {
        name: 'PasswordReset',
        relation: 'userId -> User.id',
        description: 'Password reset tokens',
        anonymizationStrategy: 'delete'
    },
    {
        name: 'SecondaryUniversityRequest',
        relation: 'userId -> User.id',
        description: 'Secondary university affiliation requests',
        anonymizationStrategy: 'delete'
    },
    {
        name: 'NotificationPreference',
        relation: 'userId -> User.id',
        description: 'User notification settings',
        anonymizationStrategy: 'delete'
    },
    {
        name: 'UserPreference',
        relation: 'userId -> User.id',
        description: 'User application preferences',
        anonymizationStrategy: 'delete'
    },
    {
        name: 'ExportJob',
        relation: 'userId -> User.id',
        description: 'User data export history',
        anonymizationStrategy: 'delete'
    },
    {
        name: 'ImportJob',
        relation: 'userId -> User.id',
        description: 'User data import history',
        anonymizationStrategy: 'delete'
    }
]

export function getDataRetentionPolicy(): Record<string, string> {
    return {
        'Profile Data': 'Deleted immediately upon user request',
        'Authentication Data': 'Deleted immediately upon user request',
        'User Generated Content': 'Anonymized (content preserved without author identification)',
        'Notifications': 'Deleted after 30 days or upon account deletion',
        'System Logs': 'Anonymized after 90 days, deleted after 1 year',
        'Export History': 'Deleted 30 days after export completion',
        'Backup Data': 'Retained for 30 days in encrypted backups'
    }
}

export function getUserDataCategories(): string[] {
    return Object.keys(userDataMap)
}

export function isSensitiveField(field: string): boolean {
    const sensitiveFields = [
        'email', 'name', 'bio', 'password',
        'verificationToken'
    ]
    return sensitiveFields.includes(field)
}
