"use client"

import * as React from "react"
import { cn } from "@/lib/utils/formatting"

export type StatusVariant = 'pending' | 'validating' | 'pitched' | 'match'

interface StatusBadgeProps {
    children: React.ReactNode
    variant: StatusVariant
    className?: string
}

export function StatusBadge({ children, variant, className }: StatusBadgeProps) {
    const variantStyles = {
        pending: "bg-amber-light text-[#92400E]", // Custom text color for contrast
        validating: "bg-[#DBEAFE] text-[#1E40AF]",
        pitched: "bg-[#E0E7FF] text-[#3730A3]",
        match: "bg-light-green text-[#065F46]",
    }

    return (
        <span
            className={cn(
                "inline-flex items-center justify-center px-3 py-1 rounded-pill font-heading font-bold text-[11px] uppercase tracking-wider",
                variantStyles[variant],
                className
            )}
        >
            {children}
        </span>
    )
}
