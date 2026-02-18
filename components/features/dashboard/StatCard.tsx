import * as React from "react"
import { LucideIcon } from "lucide-react"

export interface StatCardProps {
    label: string
    value: number | string
    icon: LucideIcon
}

export function StatCard({ label, value, icon: Icon }: StatCardProps) {
    return (
        <div className="w-full h-[100px] bg-white border border-light-gray rounded-sharp shadow-sm p-6 flex justify-between items-center">
            <div className="flex flex-col">
                <span className="font-heading font-medium text-[14px] text-cool-gray mb-1 uppercase tracking-wide">
                    {label}
                </span>
                <span className="font-heading font-bold text-[32px] text-navy leading-none">
                    {value}
                </span>
            </div>

            <div className="p-3 bg-off-white rounded-full">
                <Icon
                    size={24}
                    className="text-teal"
                />
            </div>
        </div>
    )
}
