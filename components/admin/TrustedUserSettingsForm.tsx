'use client'

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { AlertCircle } from 'lucide-react'

/**
 * DEPRECATED: Trusted user system has been removed from the schema
 */
export function TrustedUserSettingsForm() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Trusted User Settings</CardTitle>
                <CardDescription>
                    This feature has been removed.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <AlertCircle className="h-4 w-4" />
                    <p>The trusted user system has been removed in the new schema.</p>
                </div>
            </CardContent>
        </Card>
    )
}
