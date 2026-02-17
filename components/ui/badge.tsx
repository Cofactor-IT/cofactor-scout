import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils/formatting"

const badgeVariants = cva(
    "inline-flex items-center rounded-pill px-3 py-1 text-[11px] font-bold font-sans uppercase tracking-[0.005em] transition-colors focus:outline-none",
    {
        variants: {
            variant: {
                default: "bg-teal text-white",
                secondary: "bg-cool-gray text-white",
                destructive: "bg-red text-white",
                outline: "border-2 border-navy text-navy bg-white",
                student: "bg-[#3B82F6] text-white",
                trusted: "bg-[#8B5CF6] text-white",
                staff: "bg-green text-white",
                pending: "bg-amber text-white",
                admin: "bg-red text-white",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
)

export interface BadgeProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> { }

function Badge({ className, variant, ...props }: BadgeProps) {
    return (
        <div className={cn(badgeVariants({ variant }), className)} {...props} />
    )
}

export { Badge, badgeVariants }
