"use client"

import * as React from "react"
import { cn } from "@/lib/utils/formatting"
import { ChevronDown } from "lucide-react"

export interface Option {
    label: string
    value: string
}

export interface DropdownProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string
    options: Option[]
    placeholder?: string
    error?: boolean
    helperText?: string
}

const Dropdown = React.forwardRef<HTMLSelectElement, DropdownProps>(
    ({ className, label, options, placeholder, error, helperText, ...props }, ref) => {
        return (
            <div className="w-full relative flex flex-col gap-1.5">
                {label && (
                    <label className="font-heading font-medium text-[14px] text-navy">
                        {label}
                    </label>
                )}

                <div className="relative">
                    <select
                        className={cn(
                            "flex h-[48px] w-full rounded-sharp border px-4 py-3 font-body font-normal text-[16px] transition-colors appearance-none focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 bg-white",
                            error
                                ? "border-red focus:border-red bg-[#FEF2F2]"
                                : "border-light-gray text-navy focus:border-teal",
                            props.value === "" && "text-cool-gray", // Placeholder color
                            className
                        )}
                        ref={ref}
                        {...props}
                    >
                        {placeholder && (
                            <option value="" disabled>
                                {placeholder}
                            </option>
                        )}
                        {options.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>

                    <ChevronDown
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-cool-gray pointer-events-none"
                        size={20}
                    />
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
Dropdown.displayName = "Dropdown"

export { Dropdown }
