'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { useActionState } from 'react'
import { signUp } from '../actions'

const initialState = {
    error: '' as string | undefined
}

export default function SignUpPage() {
    const [state, formAction, isPending] = useActionState(signUp, initialState)

    return (
        <div className="container mx-auto flex items-center justify-center min-h-screen py-10">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl">Create an Account</CardTitle>
                    <CardDescription>
                        Join the Cofactor Club network.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={formAction} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input id="name" name="name" placeholder="John Doe" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" name="email" type="email" placeholder="john@example.com" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input id="password" name="password" type="password" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="referralCode">Referral Code</Label>
                            <Input id="referralCode" name="referralCode" placeholder="Enter code" required />
                            <p className="text-xs text-muted-foreground">
                                Use a friend&apos;s code or the staff secret code to join.
                            </p>
                        </div>

                        {state?.error && (
                            <p className="text-sm text-destructive">{state.error}</p>
                        )}

                        <Button type="submit" className="w-full" disabled={isPending}>
                            {isPending ? 'Creating Account...' : 'Sign Up'}
                        </Button>

                        <div className="text-center text-sm">
                            Already have an account?{' '}
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
