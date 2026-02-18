"use client"

import * as React from "react"
import { Check } from "lucide-react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { cn } from "@/lib/utils/formatting"

interface CheckboxProps extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> {
    label?: string
    helperText?: string
}

const Checkbox = React.forwardRef<React.ElementRef<typeof CheckboxPrimitive.Root>, CheckboxProps>(
    ({ className, label, helperText, ...props }, ref) => (
        <div className="flex items-start gap-3">
            <CheckboxPrimitive.Root
                ref={ref}
                className={cn(
                    "peer h-5 w-5 shrink-0 rounded-sharp border border-cool-gray transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-teal data-[state=checked]:border-teal data-[state=checked]:text-white mt-0.5",
                    className
                )}
                {...props}
            >
                <CheckboxPrimitive.Indicator
                    className={cn("flex items-center justify-center text-current")}
                >
                    <Check className="h-3.5 w-3.5 stroke-[3px]" />
                </CheckboxPrimitive.Indicator>
            </CheckboxPrimitive.Root>

            {(label || helperText) && (
                <div className="flex flex-col gap-1">
                    {label && (
                        <label
                            htmlFor={props.id}
                            className="font-heading font-medium text-[14px] text-navy leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer select-none"
                        >
                            {label}
                        </label>
                    )}
                    {helperText && (
                        <p className="font-heading font-normal text-[12px] text-cool-gray">
                            {helperText}
                        </p>
                    )}
                </div>
            )}
        </div>
    )
)
Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox }
