"use client"

import * as React from "react"

interface SwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {
    onCheckedChange?: (checked: boolean) => void
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
    ({ className, onCheckedChange, checked, defaultChecked, ...props }, ref) => {
        const [isChecked, setIsChecked] = React.useState(defaultChecked ?? checked ?? false)

        React.useEffect(() => {
            if (checked !== undefined) {
                setIsChecked(checked)
            }
        }, [checked])

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const newChecked = e.target.checked
            if (checked === undefined) {
                setIsChecked(newChecked)
            }
            onCheckedChange?.(newChecked)
            props.onChange?.(e)
        }

        return (
            <label className={`relative inline-flex items-center cursor-pointer ${className ?? ''}`}>
                <input
                    type="checkbox"
                    className="sr-only peer"
                    ref={ref}
                    checked={isChecked}
                    onChange={handleChange}
                    {...props}
                />
                <div className="w-11 h-6 bg-muted rounded-full peer peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-ring peer-focus:ring-offset-2 peer-focus:ring-offset-background peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
        )
    }
)
Switch.displayName = "Switch"

export { Switch }
