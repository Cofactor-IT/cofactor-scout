"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Settings, FileText, LogOut } from "lucide-react"
import { signOut } from "next-auth/react"
import { cn } from "@/lib/utils/formatting"
import { Avatar } from "@/components/ui/avatar"

interface User {
    fullName: string
    role: "SCOUT" | "CONTRIBUTOR" | "ADMIN"
    profilePictureUrl?: string | null
    firstName: string
    lastName: string
    preferredName?: string | null
}

interface ProfileDropdownProps {
    user: User
    isOpen: boolean
    onClose: () => void
}

export function ProfileDropdown({ user, isOpen, onClose }: ProfileDropdownProps) {
    const router = useRouter()

    if (!isOpen) return null

    const handleNavigation = (href: string) => {
        onClose()
        router.push(href)
    }

    const handleSignOut = async () => {
        onClose()
        await signOut({ callbackUrl: '/' })
    }

    // Role badge text
    const roleText = user.role === 'SCOUT' ? 'Verified Scout' :
        user.role === 'ADMIN' ? 'Administrator' : 'Community Contributor'

    return (
        <div className="fixed inset-0 z-[100]" onClick={onClose}>
            <div
                className="absolute right-[120px] top-[64px] w-[280px] bg-white border border-light-gray rounded-sharp shadow-popup overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-4 border-b border-light-gray">
                    <p className="font-heading font-medium text-[14px] text-navy truncate">
                        {user.fullName}
                    </p>
                    <p className="font-heading font-normal text-[12px] text-cool-gray mt-1">
                        {roleText}
                    </p>
                </div>

                {/* Menu Items */}
                <div className="py-1">
                    <button
                        onClick={() => handleNavigation('/settings')}
                        className="w-full flex items-center gap-3 px-4 py-3 font-heading font-normal text-[14px] text-navy hover:bg-off-white transition-colors"
                    >
                        <Settings size={16} className="text-cool-gray" />
                        Settings
                    </button>

                    <button
                        onClick={() => handleNavigation('/dashboard')}
                        className="w-full flex items-center gap-3 px-4 py-3 font-heading font-normal text-[14px] text-navy hover:bg-off-white transition-colors"
                    >
                        <FileText size={16} className="text-cool-gray" />
                        My Submissions
                    </button>
                </div>

                {/* Divider */}
                <div className="h-[1px] bg-light-gray w-full" />

                {/* Sign Out */}
                <div className="py-1">
                    <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-3 px-4 py-3 font-heading font-normal text-[14px] text-red hover:bg-[#FEE2E2] transition-colors"
                    >
                        <LogOut size={16} className="text-red" />
                        Sign Out
                    </button>
                </div>
            </div>
        </div>
    )
}
