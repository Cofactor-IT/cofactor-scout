"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils/formatting"

export interface LinkItem {
    label: string
    url: string
}

export interface AdditionalLinkInputProps {
    link: LinkItem
    onChange: (link: LinkItem) => void
    onRemove: () => void
    className?: string
}

export function AdditionalLinkInput({ link, onChange, onRemove, className }: AdditionalLinkInputProps) {
    return (
        <div className={cn("bg-off-white border border-light-gray rounded-sharp p-4 flex flex-col gap-3", className)}>
            <div className="flex flex-col gap-1">
                <Input
                    label="Label"
                    value={link.label}
                    onChange={(e) => onChange({ ...link, label: e.target.value })}
                    placeholder="e.g. GitHub, Portfolio, LinkedIn"
                    className="h-[40px]" // Override to smaller size per spec
                />
            </div>

            <div className="flex flex-col gap-1">
                <Input
                    label="URL"
                    value={link.url}
                    onChange={(e) => onChange({ ...link, url: e.target.value })}
                    placeholder="https://"
                    className="h-[40px]" // Override to smaller size per spec
                />
            </div>

            <div className="flex justify-end">
                <button
                    className="font-heading font-normal text-[12px] text-red underline hover:text-[#DC2626] transition-colors"
                    onClick={onRemove}
                    type="button"
                >
                    Remove
                </button>
            </div>
        </div>
    )
}
