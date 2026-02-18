'use client'

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { AlertCircle } from 'lucide-react'

/**
 * DEPRECATED: Staff domain system has been removed from the schema
 */
export function AddStaffDomainForm() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Staff Domain Management</CardTitle>
                <CardDescription>
                    This feature has been removed.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <AlertCircle className="h-4 w-4" />
                    <p>The staff domain system has been removed in the new schema.</p>
                </div>
            </CardContent>
        </Card>
    )
}
