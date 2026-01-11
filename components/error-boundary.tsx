'use client'

import React from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'

interface ErrorBoundaryProps {
    children: React.ReactNode
    fallback?: React.ComponentType<{ error: Error; retry: () => void }>
}

interface ErrorBoundaryState {
    hasError: boolean
    error: Error | null
}

/**
 * Error Boundary component to catch JavaScript errors anywhere in the child component tree,
 * log those errors, and display a fallback UI instead of the component tree that crashed.
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props)
        this.state = { hasError: false, error: null }
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error }
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        // Log error to console in development
        if (process.env.NODE_ENV === 'development') {
            console.error('Error Boundary caught an error:', error, errorInfo)
        }

        // In production, send to logging service
        if (process.env.NODE_ENV === 'production') {
            // TODO: Send to Sentry, LogRocket, or similar service
            console.error(JSON.stringify({
                error: error.message,
                stack: error.stack,
                componentStack: errorInfo.componentStack
            }))
        }
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null })
    }

    render() {
        if (this.state.hasError) {
            const FallbackComponent = this.props.fallback || DefaultErrorFallback
            return <FallbackComponent error={this.state.error!} retry={this.handleRetry} />
        }

        return this.props.children
    }
}

function DefaultErrorFallback({ error, retry }: { error: Error; retry: () => void }) {
    return (
        <div className="flex items-center justify-center min-h-screen p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-destructive flex items-center gap-2">
                        <span> Something went wrong</span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                        An unexpected error occurred. Please try again or contact support if the problem persists.
                    </p>
                    {process.env.NODE_ENV === 'development' && (
                        <details className="text-xs bg-muted p-2 rounded">
                            <summary className="cursor-pointer font-medium">Error details</summary>
                            <pre className="mt-2 overflow-auto text-red-500">{error.message}</pre>
                            {error.stack && (
                                <pre className="mt-2 overflow-auto text-xs text-gray-600">{error.stack}</pre>
                            )}
                        </details>
                    )}
                    <Button onClick={retry} className="w-full">
                        Try Again
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}

/**
 * Higher-order component version of ErrorBoundary for easier use with specific components
 */
export function withErrorBoundary<P extends object>(
    Component: React.ComponentType<P>,
    fallback?: React.ComponentType<{ error: Error; retry: () => void }>
) {
    return function WithErrorBoundaryWrapper(props: P) {
        return (
            <ErrorBoundary fallback={fallback}>
                <Component {...props} />
            </ErrorBoundary>
        )
    }
}
