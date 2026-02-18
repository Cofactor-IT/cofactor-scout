"use client"

import * as React from "react"
import { cn } from "@/lib/utils/formatting"

export interface TabItem {
    key: string
    label: string
    badge?: number
}

export interface TabsProps {
    tabs: TabItem[]
    activeTab: string
    onTabChange: (key: string) => void
    className?: string
}

export function Tabs({ tabs, activeTab, onTabChange, className }: TabsProps) {
    return (
        <div className={cn("w-full h-[48px] border-b border-light-gray flex", className)}>
            {tabs.map((tab) => {
                const isActive = tab.key === activeTab

                return (
                    <button
                        key={tab.key}
                        className={cn(
                            "h-full px-6 flex items-center gap-2 border-b-2 transition-colors relative top-[1px]",
                            isActive
                                ? "border-teal text-navy font-heading font-semibold text-[16px]"
                                : "border-transparent text-cool-gray font-heading font-medium text-[16px] hover:text-navy"
                        )}
                        onClick={() => onTabChange(tab.key)}
                    >
                        {tab.label}
                        {tab.badge !== undefined && (
                            <span className="inline-flex items-center justify-center min-w-[20px] h-[20px] rounded-pill bg-teal text-white font-heading font-bold text-[11px] px-1 top-[-1px] relative">
                                {tab.badge}
                            </span>
                        )}
                    </button>
                )
            })}
        </div>
    )
}
