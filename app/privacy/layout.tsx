/**
 * privacy/layout.tsx
 *
 * Shared layout for all /privacy/* pages.
 *
 * Feature gate: pages are only accessible when PRIVACY_PAGES_ENABLED=true
 * is set in the environment. In production this variable is not set, so
 * all three pages return 404. Set PRIVACY_PAGES_ENABLED=true in .env.local
 * to access them in development.
 *
 * Layout: AuthNavbar (fixed top) + scrollable content area + SiteFooter
 */

import { notFound } from 'next/navigation'
import { AuthNavbar } from '@/components/ui/auth-navbar'
import { SiteFooter } from '@/components/ui/SiteFooter'
import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Privacy | Cofactor Scout',
    description: 'Privacy information and data rights for Cofactor Scout users and researchers.'
}

/**
 * Layout wrapper for all privacy pages.
 * Enforces the PRIVACY_PAGES_ENABLED feature flag before rendering.
 *
 * @param children - Privacy page content
 */
export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
    // Privacy pages are disabled until all dependencies are confirmed complete.
    // Set PRIVACY_PAGES_ENABLED=true in .env.local to access in development.
    if (process.env.PRIVACY_PAGES_ENABLED !== 'true') {
        notFound()
    }

    return (
        <div className="min-h-screen bg-white flex flex-col">
            <AuthNavbar />
            {/* Offset content below the fixed navbar */}
            <main className="flex-1 pt-[78px]">
                {children}
            </main>
            <SiteFooter />
        </div>
    )
}
