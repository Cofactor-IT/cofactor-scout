"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils/formatting"

interface StickyFooterProps {
    leftButton?: {
        text: string
        onClick: () => void
        variant?: 'secondary' | 'text'
    }
    rightButton: {
        text: string
        onClick: () => void
        variant?: 'primary' | 'destructive'
        disabled?: boolean
    }
    centerButton?: {
        text: string
        onClick: () => void
    }
}

export function StickyFooter({ leftButton, centerButton, rightButton }: StickyFooterProps) {
    return (
        <footer className="fixed bottom-0 left-0 w-full h-[80px] bg-white border-t border-light-gray shadow-footer z-40 flex items-center justify-between px-[120px]">
            {/* Left */}
            <div className="flex-1 flex justify-start">
                {leftButton && (
                    <Button
                        variant={leftButton.variant || 'secondary'}
                        onClick={leftButton.onClick}
                    >
                        {leftButton.text}
                    </Button>
                )}
            </div>

            {/* Center */}
            <div className="flex-1 flex justify-center">
                {centerButton && (
                    <Button variant="secondary" onClick={centerButton.onClick}>
                        {centerButton.text}
                    </Button>
                )}
            </div>

            {/* Right */}
            <div className="flex-1 flex justify-end">
                <Button
                    variant={rightButton.variant || 'primary'}
                    onClick={rightButton.onClick}
                    disabled={rightButton.disabled}
                >
                    {rightButton.text}
                </Button>
            </div>
        </footer>
    )
}
