"use client"

import * as React from "react"
import { cn } from "@/lib/utils/formatting"
import { Lock } from "lucide-react"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string
    helperText?: string
    error?: boolean
    locked?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, label, helperText, error, locked, ...props }, ref) => {
        return (
            <div className="w-full relative flex flex-col gap-1.5">
                {label && (
                    <label className="font-heading font-medium text-[14px] text-navy">
                        {label}
                    </label>
                )}

                <div className="relative">
                    <input
                        type={type}
                        className={cn(
                            "flex h-[48px] w-full rounded-sharp border px-4 py-2 font-body font-normal text-[16px] transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-cool-gray focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
                            error
                                ? "border-red focus:border-red bg-[#FEF2F2]"
                                : locked
                                    ? "bg-off-white border-light-gray text-cool-gray cursor-not-allowed"
                                    : "bg-white border-light-gray text-navy focus:border-teal",
                            className
                        )}
                        ref={ref}
                        disabled={locked || props.disabled}
                        readOnly={locked}
                        {...props}
                    />

                    {locked && (
                        <Lock
                            size={16}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-cool-gray"
                        />
                    )}
                </div>

                {helperText && (
                    <p className={cn(
                        "font-heading text-[12px] mt-1",
                        error ? "text-red" : "text-cool-gray"
                    )}>
                        {helperText}
                    </p>
                )}
            </div>
        )
    }
)
Input.displayName = "Input"

export { Input }
