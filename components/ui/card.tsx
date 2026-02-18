"use client"

import * as React from "react"
import { cn } from "@/lib/utils/formatting"

interface CardProps {
    children: React.ReactNode
    className?: string
    padding?: 'none' | 'sm' | 'md' | 'lg'
    header?: {
        title: string
        action?: React.ReactNode
    }
}

export function Card({ children, className, padding = 'md', header }: CardProps) {
    const paddingClasses = {
        none: 'p-0',
        sm: 'p-6',
        md: 'p-8',
        lg: 'p-12',
    }[padding]

    return (
        <div className={cn("bg-white border border-light-gray rounded-sharp shadow-card", className)}>
            {/* Optional Header */}
            {header && (
                <div className="flex items-center justify-between px-8 py-6 border-b border-light-gray">
                    <h3 className="font-heading font-bold text-[24px] text-navy">
                        {header.title}
                    </h3>
                    {header.action && <div>{header.action}</div>}
                </div>
            )}

            {/* Content */}
            <div className={paddingClasses}>
                {children}
            </div>
        </div>
    )
}
