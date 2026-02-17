'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { useState, Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function SignInForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const error = searchParams.get('error')
    const message = searchParams.get('message')
    const [isLoading, setIsLoading] = useState(false)
    const [signInError, setSignInError] = useState<string | null>(null)
    const [email, setEmail] = useState('')
    const [showMessage, setShowMessage] = useState(true)

    // Hide message after 5 seconds
    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => setShowMessage(false), 5000)
            return () => clearTimeout(timer)
        }
    }, [message])

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setIsLoading(true)
        setSignInError(null)

        const formData = new FormData(event.currentTarget)
        const emailValue = formData.get('email') as string
        const password = formData.get('password') as string

        const result = await signIn('credentials', {
            email: emailValue,
            password,
            redirect: false,
        })

        if (result?.error) {
            // For NextAuth, Credentials provider always returns 'CredentialsSignin' error
            // regardless of whether user exists or password is wrong
            // Show a helpful message directing to sign up
            setSignInError('Invalid email or password. If you don\'t have an account, please sign up.')
        } else {
            router.push('/profile')
            router.refresh()
        }
        setIsLoading(false)
    }

    return (
        <Card className="w-full max-w-md">
            <CardHeader>
                <CardTitle className="text-2xl">Welcome Back</CardTitle>
                <CardDescription>
                    Sign in to your Cofactor Club account.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={onSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="john@example.com"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="password">Password</Label>
                            <Link href="/auth/forgot-password" className="text-xs text-cool-gray hover:text-teal">
                                Forgot password?
                            </Link>
                        </div>
                        <Input id="password" name="password" type="password" required />
                    </div>

                    {signInError && (
                        <div className="p-3 bg-red/10 border-2 border-red rounded-sharp">
                            <p className="text-sm text-red">{signInError}</p>
                            <Link
                                href={`/auth/signup?email=${encodeURIComponent(email)}`}
                                className="text-sm text-teal underline mt-1 inline-block hover:text-teal-dark"
                            >
                                Create an account with this email →
                            </Link>
                        </div>
                    )}

                    {error && !signInError && (
                        <p className="text-sm text-red">
                            {error === 'AccessDenied' ? 'Access Denied: You do not have permission.' : 'Invalid credentials. Please try again.'}
                        </p>
                    )}

                    {message && showMessage && (
                        <p className="text-sm text-green">
                            {message}
                        </p>
                    )}

                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? 'Signing in...' : 'Sign In'}
                    </Button>

                    <div className="text-center text-sm text-navy">
                        Don&apos;t have an account?{' '}
                        <Link href="/auth/signup" className="text-teal underline hover:text-teal-dark">
                            Sign up
                        </Link>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}

export default function SignInPage() {
    return (
        <div className="container mx-auto flex items-center justify-center min-h-screen py-10 bg-off-white">
            <Suspense fallback={
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle className="text-2xl">Welcome Back</CardTitle>
                        <CardDescription>Loading...</CardDescription>
                    </CardHeader>
                </Card>
            }>
                <SignInForm />
            </Suspense>
        </div>
    )
}
