"use client"

import * as React from "react"
import { Search, X } from "lucide-react"
import { cn } from "@/lib/utils/formatting"

export interface SearchBarProps {
    placeholder?: string
    value: string
    onChange: (value: string) => void
    onClear?: () => void
    className?: string
}

export function SearchBar({ placeholder = 'Search...', value, onChange, onClear, className }: SearchBarProps) {
    return (
        <div className={cn("relative w-full", className)}>
            <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-cool-gray pointer-events-none"
                size={16}
            />

            <input
                type="text"
                className="flex h-[48px] w-full rounded-sharp border-2 border-light-gray bg-white pl-12 pr-12 py-3 text-[16px] font-body text-navy placeholder:text-cool-gray focus-visible:outline-none focus:border-teal transition-colors"
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />

            {value && onClear && (
                <button
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-cool-gray hover:text-navy transition-colors"
                    onClick={onClear}
                >
                    <X size={14} />
                </button>
            )}
        </div>
    )
}
