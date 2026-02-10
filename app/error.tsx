'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Home, RefreshCw } from 'lucide-react'
import Link from 'next/link'

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <Card className="max-w-md w-full">
                <CardHeader>
                    <CardTitle className="text-destructive">Something went wrong</CardTitle>
                    <CardDescription>
                        {error.message || 'An unexpected error occurred. Please try again.'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {process.env.NODE_ENV === 'development' && error.stack && (
                        <details className="mt-4 text-xs text-muted-foreground">
                            <summary className="cursor-pointer hover:text-foreground">Error details</summary>
                            <pre className="mt-2 overflow-auto p-2 rounded bg-muted">{error.stack}</pre>
                        </details>
                    )}
                </CardContent>
                <CardFooter className="flex gap-2">
                    <Button onClick={reset} variant="default">
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Try Again
                    </Button>
                    <Button asChild variant="outline">
                        <Link href="/">
                            <Home className="mr-2 h-4 w-4" />
                            Home
                        </Link>
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}
