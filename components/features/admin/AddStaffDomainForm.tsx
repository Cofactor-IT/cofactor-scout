'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useActionState } from 'react'
import { addStaffDomain } from '@/actions/admin-settings.actions'

const initialState = {
    error: '' as string | undefined,
    success: '' as string | undefined
}

export function AddStaffDomainForm() {
    // @ts-expect-error - Next.js 15/16 types are still catching up with React 19 actions
    const [state, formAction, isPending] = useActionState(addStaffDomain, initialState)

    return (
        <form action={formAction} className="flex gap-4 items-end">
            <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="domain">Target Domain</Label>
                <div className="flex flex-col gap-2">
                    <Input
                        type="text"
                        id="domain"
                        name="domain"
                        placeholder="example.com"
                        required
                    />
                    {state?.error && (
                        <p className="text-sm text-destructive">{state.error}</p>
                    )}
                    {state?.success && (
                        <p className="text-sm text-green-600">{state.success}</p>
                    )}
                </div>
            </div>
            <Button type="submit" disabled={isPending}>
                {isPending ? 'Adding...' : 'Add Domain'}
            </Button>
        </form>
    )
}
