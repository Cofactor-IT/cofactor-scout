"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { cn } from "@/lib/utils/formatting"
import { StatusBadge } from "@/components/ui/status-badge"

interface PageHeaderProps {
    title: string
    subtitle?: string
    backLink?: {
        text: string
        href: string
    }
    badge?: {
        text: string
        variant: 'pending' | 'validating' | 'pitched' | 'match'
    }
    date?: string
}

export function PageHeader({ title, subtitle, backLink, badge, date }: PageHeaderProps) {
    return (
        <header className="w-full bg-off-white border-b border-light-gray px-[120px] py-[28px]">
            <div className="max-w-[1200px] mx-auto">
                {/* Back Link */}
                {backLink && (
                    <Link
                        href={backLink.href}
                        className="inline-flex items-center gap-2 mb-2 font-heading font-medium text-[14px] text-teal underline decoration-teal hover:text-teal-dark transition-colors"
                    >
                        <ArrowLeft size={14} />
                        {backLink.text}
                    </Link>
                )}

                {/* Title */}
                <h1 className="font-heading font-bold text-[36px] text-navy tracking-[-0.005em] leading-tight mb-2">
                    {title}
                </h1>

                {/* Subtitle */}
                {subtitle && (
                    <p className="font-body font-normal text-[16px] text-cool-gray leading-normal max-w-[700px]">
                        {subtitle}
                    </p>
                )}

                {/* Meta Row (Badge + Date) */}
                {(badge || date) && (
                    <div className="flex items-center gap-4 mt-3">
                        {badge && (
                            <StatusBadge variant={badge.variant}>
                                {badge.text}
                            </StatusBadge>
                        )}
                        {date && (
                            <span className="font-heading font-normal text-[14px] text-cool-gray">
                                {date}
                            </span>
                        )}
                    </div>
                )}
            </div>
        </header>
    )
}
