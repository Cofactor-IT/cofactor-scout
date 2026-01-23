'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { useActionState } from 'react'
import { requestPasswordReset } from '../actions'

const initialState = { error: '', success: '' } as { error?: string; success?: string }

export default function ForgotPasswordPage() {
    const [state, formAction, isPending] = useActionState(requestPasswordReset, initialState)

    return (
        <div className="container mx-auto flex items-center justify-center min-h-screen py-10">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl">Forgot Password</CardTitle>
                    <CardDescription>
                        Enter your email address and we&apos;ll send you a link to reset your password.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={formAction} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="john@example.com"
                                required
                            />
                        </div>

                        {state?.error && (
                            <p className="text-sm text-destructive">{state.error}</p>
                        )}

                        {state?.success && (
                            <p className="text-sm text-green-600">{state.success}</p>
                        )}

                        <Button type="submit" className="w-full" disabled={isPending}>
                            {isPending ? 'Sending...' : 'Send Reset Link'}
                        </Button>

                        <div className="text-center text-sm">
                            Remember your password?{' '}
                            <Link href="/auth/signin" className="underline">
                                Sign in
                            </Link>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
