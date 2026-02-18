import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { requireAdmin } from '@/lib/auth/session'
import { getSystemSettings } from '@/lib/settings'
import { NotificationSettingsForm } from '@/components/admin/NotificationSettingsForm'
import { TrustedUserSettingsForm } from '@/components/admin/TrustedUserSettingsForm'
import { AddStaffDomainForm } from '@/components/features/admin/AddStaffDomainForm'

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
    await requireAdmin()

    const settings = await getSystemSettings()

    return (
        <div className="container mx-auto py-10 space-y-8">
            <h1 className="text-4xl font-bold">Admin Settings</h1>

            <NotificationSettingsForm initialSettings={settings} />

            <TrustedUserSettingsForm />

            <AddStaffDomainForm />
        </div>
    )
}
