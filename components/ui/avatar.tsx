import * as React from "react"
import { cn } from "@/lib/utils/formatting"

export interface AvatarProps {
    src?: string | null
    initials: string
    size?: 'sm' | 'md' | 'lg'
    onClick?: () => void
    className?: string
}

export function Avatar({ src, initials, size = 'md', onClick, className }: AvatarProps) {
    const sizeClasses = {
        sm: 'w-[32px] h-[32px] text-[11px]',
        md: 'w-[40px] h-[40px] text-[14px]',
        lg: 'w-[80px] h-[80px] text-[18px]',
    }[size]

    const baseClasses = cn(
        "inline-flex items-center justify-center rounded-pill border-2 border-light-gray overflow-hidden flex-shrink-0 object-cover",
        sizeClasses,
        onClick && "cursor-pointer",
        className
    )

    if (src) {
        return (
            <img
                src={src}
                alt={initials}
                className={baseClasses}
                onClick={onClick}
            />
        )
    }

    return (
        <div
            className={cn(baseClasses, "bg-navy text-white font-heading font-bold select-none")}
            onClick={onClick}
        >
            {initials.substring(0, 2).toUpperCase()}
        </div>
    )
}
