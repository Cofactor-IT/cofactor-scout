'use client'

import { SessionProvider } from 'next-auth/react'

export function Providers({ children, nonce }: { children: React.ReactNode, nonce?: string }) {
    return (
        <SessionProvider>
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
