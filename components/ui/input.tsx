import * as React from "react"
import { cn } from "@/lib/utils/formatting"

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, ...props }, ref) => {
        return (
            <input
                type={type}
                className={cn(
                    "flex w-full rounded-sharp border-2 border-light-gray bg-white px-4 py-3 text-base text-navy font-serif font-normal leading-[1.5] placeholder:text-cool-gray focus-visible:outline-none focus-visible:border-teal disabled:cursor-not-allowed disabled:bg-light-gray disabled:opacity-50 transition-colors",
                    className
                )}
                ref={ref}
                {...props}
            />
        )
    }
)
Input.displayName = "Input"

export { Input }
