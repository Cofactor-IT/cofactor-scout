'use client'

import { useState, useTransition } from 'react'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { updateNotificationSettings } from '@/app/admin/settings/actions'
import { Loader2, CheckCircle2, XCircle } from 'lucide-react'

interface NotificationSettingsFormProps {
    initialSettings: {
        enableStudentEmails: boolean
        enableAdminEmails: boolean
        enableInAppNotifications: boolean
    }
}

export function NotificationSettingsForm({ initialSettings }: NotificationSettingsFormProps) {
    const [settings, setSettings] = useState(initialSettings)
    const [isPending, startTransition] = useTransition()
    const [hasChanges, setHasChanges] = useState(false)

    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null)

    const handleToggle = (key: keyof typeof settings) => {
        setSettings(prev => {
            const next = { ...prev, [key]: !prev[key] }
            setHasChanges(true)
            setStatus(null)
            return next
        })
    }

    const handleSave = () => {
        startTransition(async () => {
            try {
                await updateNotificationSettings(settings)
                setStatus({ type: 'success', message: 'Notification settings saved successfully.' })
                setHasChanges(false)
            } catch (error) {
                setStatus({ type: 'error', message: 'Failed to save settings.' })
            }
        })
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Global Notification Settings</CardTitle>
                <CardDescription>
                    Control which notifications are sent system-wide.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-center justify-between space-x-2">
                    <div className="space-y-0.5">
                        <Label htmlFor="student-emails">Student Emails</Label>
                        <p className="text-sm text-muted-foreground">
                            Send emails to students (Welcome, Verification, Mentions, Updates)
                        </p>
                    </div>
                    <Switch
                        id="student-emails"
                        checked={settings.enableStudentEmails}
                        onCheckedChange={() => handleToggle('enableStudentEmails')}
                    />
                </div>
                <div className="flex items-center justify-between space-x-2">
                    <div className="space-y-0.5">
                        <Label htmlFor="admin-emails">Admin Emails</Label>
                        <p className="text-sm text-muted-foreground">
                            Send alerts to admins (New Revisions, etc.)
                        </p>
                    </div>
                    <Switch
                        id="admin-emails"
                        checked={settings.enableAdminEmails}
                        onCheckedChange={() => handleToggle('enableAdminEmails')}
                    />
                </div>
                <div className="flex items-center justify-between space-x-2">
                    <div className="space-y-0.5">
                        <Label htmlFor="in-app">In-App Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                            Generate in-app notifications for users
                        </p>
                    </div>
                    <Switch
                        id="in-app"
                        checked={settings.enableInAppNotifications}
                        onCheckedChange={() => handleToggle('enableInAppNotifications')}
                    />
                </div>

                {status && (
                    <div className={`flex items-center gap-2 text-sm ${status.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                        {status.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                        {status.message}
                    </div>
                )}
                <div className="pt-4 flex justify-end">
                    <Button
                        onClick={handleSave}
                        disabled={!hasChanges || isPending}
                    >
                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
