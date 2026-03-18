/**
 * SiteFooter.tsx
 *
 * Global site footer for public-facing pages (privacy pages, etc.).
 * Includes privacy navigation links and cookie consent trigger.
 *
 * Used in the privacy page layout. The landing page has its own inline
 * footer with a different CTA — this component is for all other public pages.
 */

import Link from 'next/link'
import { CookieConsentTrigger } from '@/components/cookie-consent/Trigger'

/**
 * Site-wide footer with privacy links and cookie consent management.
 * Renders privacy policy, researcher notice, and data request links.
 */
export function SiteFooter() {
    const currentYear = new Date().getFullYear()

    return (
        <footer className="w-full bg-[#FAFBFC] border-t border-[#E5E7EB] px-4 md:px-8 lg:px-[120px] py-6 md:py-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 max-w-[1200px] mx-auto">

                {/* Privacy navigation links */}
                <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
                    <Link
                        href="/privacy/policy"
                        className="caption text-[#6B7280] hover:text-[#0D7377] transition-colors"
                    >
                        Privacy Policy
                    </Link>
                    <div className="hidden md:block text-[#E5E7EB]">|</div>
                    <Link
                        href="/privacy/researchers"
                        className="caption text-[#6B7280] hover:text-[#0D7377] transition-colors"
                    >
                        Researcher Notice
                    </Link>
                    <div className="hidden md:block text-[#E5E7EB]">|</div>
                    <Link
                        href="/privacy/request"
                        className="caption text-[#6B7280] hover:text-[#0D7377] transition-colors"
                    >
                        Submit a Request
                    </Link>
                    <div className="hidden md:block text-[#E5E7EB]">|</div>
                    <CookieConsentTrigger />
                </div>

                {/* Copyright */}
                <p className="caption text-[#6B7280]">
                    &copy; {currentYear} Cofactor World. All rights reserved.
                </p>
            </div>
        </footer>
    )
}
