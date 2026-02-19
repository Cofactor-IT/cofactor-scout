'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
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
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-[#FAFBFC]">
            <Card className="max-w-md w-full p-[1.67vw]">
                <div className="flex flex-col gap-[1.67vw]">
                    <h3 className="text-[#1B2A4A]">Something went wrong</h3>
                    <p className="body text-[#6B7280]">
                        {error.message || 'An unexpected error occurred. Please try again.'}
                    </p>

                    {process.env.NODE_ENV === 'development' && error.stack && (
                        <details className="text-xs text-[#6B7280]">
                            <summary className="cursor-pointer hover:text-[#1B2A4A]">Error details</summary>
                            <pre className="mt-2 overflow-auto p-2 rounded bg-[#FAFBFC] border border-[#E5E7EB]">{error.stack}</pre>
                        </details>
                    )}

                    <div className="flex gap-[1.11vw]">
                        <Button onClick={reset}>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Try Again
                        </Button>
                        <Link href="/">
                            <Button variant="secondary">
                                <Home className="mr-2 h-4 w-4" />
                                Home
                            </Button>
                        </Link>
                    </div>
                </div>
            </Card>
        </div>
    )
}
