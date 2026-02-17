import * as React from "react"
import { cn } from "@/lib/utils/formatting"

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className, ...props }, ref) => {
        return (
            <textarea
                className={cn(
                    "flex min-h-[120px] w-full rounded-sharp border-2 border-light-gray bg-white px-4 py-3 text-base text-navy font-serif font-normal leading-[1.5] placeholder:text-cool-gray focus-visible:outline-none focus-visible:border-teal disabled:cursor-not-allowed disabled:bg-light-gray disabled:opacity-50 resize-vertical transition-colors",
                    className
                )}
                ref={ref}
                {...props}
            />
        )
    }
)
Textarea.displayName = "Textarea"

export { Textarea }
