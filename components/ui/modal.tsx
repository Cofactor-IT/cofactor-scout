"use client"

import * as React from "react"
import { cn } from "@/lib/utils/formatting"
import { X } from "lucide-react"

export interface ModalProps {
    isOpen: boolean
    onClose: () => void
    title: string
    children: React.ReactNode
    footer?: React.ReactNode
    size?: 'sm' | 'md' | 'lg'
}

export function Modal({ isOpen, onClose, title, children, footer, size = 'md' }: ModalProps) {
    if (!isOpen) return null

    const sizeClasses = {
        sm: 'w-[480px]',
        md: 'w-[640px]',
        lg: 'w-[800px]',
    }[size]

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className={cn(
                    "bg-white rounded-sharp shadow-popup p-12 relative max-h-[90vh] overflow-y-auto flex flex-col",
                    sizeClasses
                )}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    className="absolute top-6 right-6 p-2 text-cool-gray hover:text-navy transition-colors"
                    onClick={onClose}
                >
                    <X size={20} />
                </button>

                {/* Title */}
                <h2 className="font-heading font-bold text-[24px] text-navy mb-4">
                    {title}
                </h2>

                {/* Content */}
                <div className={cn("flex-1", footer && "mb-8")}>
                    {children}
                </div>

                {/* Footer */}
                {footer && (
                    <div className="flex justify-end gap-4 pt-6 border-t border-light-gray mt-auto">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    )
}
