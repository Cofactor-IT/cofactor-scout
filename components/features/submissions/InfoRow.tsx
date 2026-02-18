import * as React from "react"
import { cn } from "@/lib/utils/formatting"

export interface InfoRowProps {
    label: string
    value: React.ReactNode
    isLink?: boolean
    className?: string
}

export function InfoRow({ label, value, isLink, className }: InfoRowProps) {
    return (
        <div className={cn(
            "grid grid-cols-[200px_1fr] gap-6 py-3.5 border-b border-light-gray last:border-b-0",
            className
        )}>
            <span className="font-heading font-medium text-[12px] text-cool-gray uppercase tracking-wider">
                {label}
            </span>
            <span className={cn(
                "font-body font-normal text-[16px] text-navy leading-relaxed",
                isLink && "text-teal underline decoration-teal hover:text-teal-dark cursor-pointer"
            )}>
                {value}
            </span>
        </div>
    )
}
