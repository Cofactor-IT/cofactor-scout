"use client"

import * as React from "react"
import { cn } from "@/lib/utils/formatting"

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string
    helperText?: string
    error?: boolean
    showCount?: boolean
    maxLength?: number
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className, label, helperText, error, showCount, maxLength, value, ...props }, ref) => {
        const length = typeof value === 'string' ? value.length : 0

        return (
            <div className="w-full relative flex flex-col gap-1.5">
                {label && (
                    <label className="font-heading font-medium text-[14px] text-navy">
                        {label}
                    </label>
                )}

                <textarea
                    className={cn(
                        "flex min-h-[120px] w-full rounded-sharp border px-4 py-3 font-body font-normal text-[16px] transition-colors placeholder:text-cool-gray focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 resize-y",
                        error
                            ? "border-red focus:border-red bg-[#FEF2F2]"
                            : "bg-white border-light-gray text-navy focus:border-teal",
                        className
                    )}
                    ref={ref}
                    maxLength={maxLength}
                    value={value}
                    {...props}
                />

                <div className="flex justify-between items-start mt-1">
                    {helperText ? (
                        <p className={cn(
                            "font-heading text-[12px]",
                            error ? "text-red" : "text-cool-gray"
                        )}>
                            {helperText}
                        </p>
                    ) : <span />}

                    {showCount && maxLength && (
                        <span className="font-heading text-[12px] text-cool-gray text-right">
                            {length}/{maxLength}
                        </span>
                    )}
                </div>
            </div>
        )
    }
)
Textarea.displayName = "Textarea"

export { Textarea }
