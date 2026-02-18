"use client"

import * as React from "react"
import { cn } from "@/lib/utils/formatting"
import { Check } from "lucide-react"

export interface Step {
    number: number
    label: string
}

export interface ProgressIndicatorProps {
    steps: Step[]
    currentStep: number
    className?: string
}

export function ProgressIndicator({ steps, currentStep, className }: ProgressIndicatorProps) {
    return (
        <div className={cn("w-full max-w-[600px] mx-auto flex items-center justify-center relative", className)}>
            {steps.map((step, idx) => {
                const isCompleted = step.number < currentStep
                const isActive = step.number === currentStep
                const isFuture = step.number > currentStep

                return (
                    <React.Fragment key={step.number}>
                        {/* Connecting Line (before the step, except first) */}
                        {/* Note: Spec says line is between circles.
                            We render line AFTER the circle, except for the last one.
                        */}

                        <div className="flex flex-col items-center relative z-10">
                            <div className={cn(
                                "w-6 h-6 rounded-pill flex items-center justify-center transition-colors border-2",
                                isCompleted ? "bg-teal border-teal text-white" :
                                    isActive ? "bg-navy border-navy text-white" :
                                        "bg-white border-light-gray text-cool-gray"
                            )}>
                                {isCompleted ? (
                                    <Check size={12} strokeWidth={3} />
                                ) : (
                                    <span className="font-heading font-bold text-[12px]">
                                        {step.number}
                                    </span>
                                )}
                            </div>

                            <p className={cn(
                                "absolute top-8 font-heading font-medium text-[12px] whitespace-nowrap transition-colors",
                                isCompleted ? "text-teal" :
                                    isActive ? "text-navy" :
                                        "text-cool-gray"
                            )}>
                                {step.label}
                            </p>
                        </div>

                        {/* Line to next step */}
                        {idx < steps.length - 1 && (
                            <div className={cn(
                                "flex-1 h-[2px] mx-2 min-w-[40px] transition-colors",
                                step.number < currentStep ? "bg-teal" : "bg-light-gray"
                            )} />
                        )}
                    </React.Fragment>
                )
            })}
        </div>
    )
}
