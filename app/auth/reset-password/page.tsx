'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { useActionState, useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { resetPassword } from '../actions'

const initialState = { error: '', success: '' } as { error?: string; success?: string }

function ResetPasswordForm() {
    const searchParams = useSearchParams()
    const token = searchParams.get('token')
    const [isValidToken, setIsValidToken] = useState(!!token)

    const [state, formAction, isPending] = useActionState(resetPassword, initialState)
    const [isSuccess, setIsSuccess] = useState(false)

    useEffect(() => {
        if (!token) {
            setIsValidToken(false)
        }
    }, [token])

    useEffect(() => {
        if (state?.success) {
            setIsSuccess(true)
        }
    }, [state])

    if (!isValidToken) {
        return (
            <div className="container mx-auto flex items-center justify-center min-h-screen py-10">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle className="text-2xl text-destructive">Invalid Link</CardTitle>
                        <CardDescription>
                            This password reset link is invalid.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Link href="/auth/forgot-password">
                            <Button className="w-full">Request New Reset Link</Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        )
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
                        Enter your new password below.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={formAction} className="space-y-4">
                        <input type="hidden" name="token" value={token || ''} />

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

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={
            <div className="container mx-auto flex items-center justify-center min-h-screen py-10">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle className="text-2xl">Reset Password</CardTitle>
                        <CardDescription>Loading...</CardDescription>
                    </CardHeader>
                </Card>
            </div>
        }>
            <ResetPasswordForm />
        </Suspense>
    )
}
