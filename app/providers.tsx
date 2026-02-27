/**
 * Providers Component
 * 
 * Wraps app with NextAuth SessionProvider and sets webpack nonce for CSP.
 */
'use client'

import { SessionProvider } from 'next-auth/react'

export function Providers({ children, nonce }: { children: React.ReactNode, nonce?: string }) {
    return (
        <SessionProvider>
            {/* Set webpack nonce for Content Security Policy */}
            <script
                nonce={nonce}
                dangerouslySetInnerHTML={{
                    __html: `window.__webpack_nonce__ = "${nonce}"`
                }}
                suppressHydrationWarning
            />
            {children}
        </SessionProvider>
    )
}
