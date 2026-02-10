'use client'

import { Analytics } from '@vercel/analytics/react'

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
    return (
        <>
            {children}
            <Analytics />
        </>
    )
}
