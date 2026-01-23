'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { useActionState, useState, useEffect, useCallback } from 'react'
import { signUp } from '../actions'

const initialState = {
    error: '' as string | undefined
}

type UniversityLookup = {
    university: { id: string; name: string } | null
    isPersonalEmail: boolean
    domain: string
}

export default function SignUpPage() {
    const [state, formAction, isPending] = useActionState(signUp, initialState)
    const [email, setEmail] = useState('')
    const [universityLookup, setUniversityLookup] = useState<UniversityLookup | null>(null)
    const [isLookingUp, setIsLookingUp] = useState(false)

    // Debounced university lookup
    const lookupUniversity = useCallback(async (emailValue: string) => {
        if (!emailValue.includes('@')) {
            setUniversityLookup(null)
            return
        }

        setIsLookingUp(true)
        try {
            const response = await fetch(`/api/universities/lookup?email=${encodeURIComponent(emailValue)}`)
            if (response.ok) {
                const data = await response.json()
                setUniversityLookup(data)
            } else {
                throw new Error('API response not ok')
            }
        } catch (error) {
            console.error('Failed to lookup university:', error)
            // Fallback: allow manual entry if check fails
            setUniversityLookup({
                university: null,
                isPersonalEmail: false,
                domain: emailValue.split('@')[1] || ''
            })
        } finally {
            setIsLookingUp(false)
        }
    }, [])

    useEffect(() => {
        const timer = setTimeout(() => {
            if (email) {
                lookupUniversity(email)
            } else {
                setUniversityLookup(null)
            }
        }, 500) // 500ms debounce

        return () => clearTimeout(timer)
    }, [email, lookupUniversity])

    const showUniversityNameInput = universityLookup &&
        !universityLookup.university &&
        !universityLookup.isPersonalEmail &&
        email.includes('@')

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
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="john@university.edu"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />

                            {/* University Detection Feedback */}
                            {isLookingUp && (
                                <p className="text-sm text-muted-foreground">Checking university...</p>
                            )}

                            {universityLookup?.university && (
                                <div className="p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-md">
                                    <p className="text-sm text-green-700 dark:text-green-300 font-medium">
                                        ✓ University detected: {universityLookup.university.name}
                                    </p>
                                    <input type="hidden" name="universityId" value={universityLookup.university.id} />
                                </div>
                            )}

                            {universityLookup?.isPersonalEmail && (
                                <div className="p-3 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-md">
                                    <p className="text-sm text-yellow-700 dark:text-yellow-300">
                                        ⚠ Please use your university email for better features and verification.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* University Name Input for Unknown Domains */}
                        {showUniversityNameInput && (
                            <div className="space-y-2">
                                <div className="p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-md mb-2">
                                    <p className="text-sm text-blue-700 dark:text-blue-300">
                                        We don&apos;t recognize this email domain. Please enter your university name.
                                    </p>
                                </div>
                                <Label htmlFor="universityName">University Name</Label>
                                <Input
                                    id="universityName"
                                    name="universityName"
                                    placeholder="e.g., Technical University of Berlin"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Your university will be added pending admin approval.
                                </p>
                            </div>
                        )}

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
