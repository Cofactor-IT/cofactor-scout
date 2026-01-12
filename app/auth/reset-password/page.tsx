'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { useActionState, useState } from 'react'
import { resetPassword } from '../actions'

const initialState = { error: '', success: '' } as { error?: string; success?: string }

export default function ResetPasswordPage() {
    const [state, formAction, isPending] = useActionState(resetPassword, initialState)
    const [isSuccess, setIsSuccess] = useState(false)
    const [code, setCode] = useState('')

    // Check if success state changed
    if (state?.success && !isSuccess) {
        setIsSuccess(true)
    }

    if (isSuccess) {
        return (
            <div className="container mx-auto flex items-center justify-center min-h-screen py-10">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle className="text-2xl text-green-600">Password Reset Successful</CardTitle>
                        <CardDescription>
                            Your password has been reset. You can now sign in with your new password.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Link href="/auth/signin">
                            <Button className="w-full">Go to Sign In</Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="container mx-auto flex items-center justify-center min-h-screen py-10">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl">Reset Password</CardTitle>
                    <CardDescription>
                        Enter the 6-digit code from your email and your new password.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={formAction} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="code">Reset Code</Label>
                            <Input
                                id="code"
                                name="token"
                                type="text"
                                placeholder="123456"
                                required
                                maxLength={6}
                                pattern="\d{6}"
                                value={code}
                                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                className="text-center text-2xl tracking-widest font-mono"
                            />
                            <p className="text-xs text-muted-foreground">
                                Enter the 6-digit code sent to your email
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">New Password</Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                placeholder="Enter new password"
                                required
                                minLength={8}
                            />
                        </div>

                        {state?.error && (
                            <p className="text-sm text-destructive">{state.error}</p>
                        )}

                        {state?.success && (
                            <p className="text-sm text-green-600">{state.success}</p>
                        )}

                        <Button type="submit" className="w-full" disabled={isPending}>
                            {isPending ? 'Resetting...' : 'Reset Password'}
                        </Button>

                        <div className="text-center text-sm">
                            <Link href="/auth/forgot-password" className="underline">
                                Request a new code
                            </Link>
                            {' · '}
                            <Link href="/auth/signin" className="underline">
                                Back to Sign In
                            </Link>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
