import * as React from "react"
import { AlertCircle, AlertTriangle, CheckCircle, XCircle, LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils/formatting"

export type AlertVariant = 'info' | 'warning' | 'success' | 'error'

export interface AlertBannerProps {
    variant: AlertVariant
    icon?: LucideIcon
    children: React.ReactNode
    className?: string
}

export function AlertBanner({ variant, icon: Icon, children, className }: AlertBannerProps) {
    const defaultIcons = {
        info: AlertCircle,
        warning: AlertTriangle,
        success: CheckCircle,
        error: XCircle,
    }

    const IconComponent = Icon || defaultIcons[variant]

    const variantStyles = {
        info: "bg-[#DBEAFE] border-[#1E40AF] text-[#1E40AF]",
        warning: "bg-[#FEF3C7] border-[#F59E0B] text-[#F59E0B]",
        success: "bg-[#D1FAE5] border-[#2D7D46] text-[#2D7D46]",
        error: "bg-[#FEE2E2] border-[#EF4444] text-[#EF4444]",
    }

    return (
        <div className={cn(
            "w-full min-h-[80px] rounded-sharp border-2 p-6 flex gap-4 items-start my-6",
            variantStyles[variant],
            className
        )}>
            <IconComponent size={24} className="flex-shrink-0" />
            <div className="flex-1 font-heading font-normal text-[14px] text-navy leading-relaxed">
                {children}
            </div>
        </div>
    )
}
