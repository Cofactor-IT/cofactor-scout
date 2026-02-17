import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils/formatting"

const buttonVariants = cva(
    "inline-flex items-center justify-center whitespace-nowrap font-sans text-base font-medium transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
    {
        variants: {
            variant: {
                default: "bg-teal text-white rounded-pill hover:bg-teal-dark hover:-translate-y-0.5 shadow-[0px_2px_4px_rgba(13,115,119,0.20)]",
                destructive: "bg-red text-white rounded-pill hover:bg-[#DC2626] hover:-translate-y-0.5",
                outline: "bg-white text-navy border-2 border-navy rounded-pill hover:bg-navy hover:text-white",
                secondary: "bg-white text-navy border-2 border-navy rounded-pill hover:bg-navy hover:text-white",
                ghost: "hover:bg-off-white text-navy",
                link: "text-teal underline font-semibold hover:text-teal-dark",
            },
            size: {
                default: "px-6 py-3 text-base",
                sm: "px-4 py-2 text-sm",
                lg: "px-8 py-4 text-lg",
                icon: "h-10 w-10",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
)

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : "button"
        return (
            <Comp
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button, buttonVariants }
