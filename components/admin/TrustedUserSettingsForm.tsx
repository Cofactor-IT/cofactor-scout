'use client'

import { useState, useTransition } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { updateTrustedUserSettings } from '@/actions/admin-settings.actions'
import { Loader2, CheckCircle2, XCircle } from 'lucide-react'

interface TrustedUserSettingsFormProps {
    initialLimit: number
}

export function TrustedUserSettingsForm({ initialLimit }: TrustedUserSettingsFormProps) {
    const [limit, setLimit] = useState(initialLimit)
    const [isPending, startTransition] = useTransition()
    const [hasChanges, setHasChanges] = useState(false)
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value)
        if (!isNaN(value) && value >= 0) {
            setLimit(value)
            setHasChanges(value !== initialLimit)
            setStatus(null)
        }
    }

    const handleSave = () => {
        startTransition(async () => {
            try {
                await updateTrustedUserSettings(limit)
                setStatus({ type: 'success', message: 'Settings saved successfully.' })
                setHasChanges(false)
            } catch (error) {
                setStatus({ type: 'error', message: 'Failed to save settings.' })
            }
        })
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Trusted User Settings</CardTitle>
                <CardDescription>
                    Configure limits for trusted users.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-center justify-between space-x-2">
                    <div className="space-y-0.5">
                        <Label htmlFor="daily-limit">Daily Auto-Approve Limit</Label>
                        <p className="text-sm text-muted-foreground">
                            Number of changes a trusted user can make per day without approval.
                        </p>
                    </div>
                    <div className="w-24">
                        <Input
                            id="daily-limit"
                            type="number"
                            min="0"
                            value={limit}
                            onChange={handleChange}
                        />
                    </div>
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
