"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils/formatting"
import { Button } from "@/components/ui/button"
import { Avatar } from "@/components/ui/avatar"
import { ProfileDropdown } from "./ProfileDropdown"

interface User {
    fullName: string
    role: "SCOUT" | "CONTRIBUTOR" | "ADMIN"
    profilePictureUrl?: string | null
    firstName: string
    lastName: string
    preferredName?: string | null
    email?: string
}

interface NavbarProps {
    user?: User | null
}

export function Navbar({ user }: NavbarProps) {
    const pathname = usePathname()
    const [isProfileOpen, setIsProfileOpen] = React.useState(false)

    // Helper to get initials
    const getInitials = (u: User) => {
        if (u.preferredName) {
            return u.preferredName.substring(0, 2).toUpperCase()
        }
        const first = u.firstName.charAt(0)
        const last = u.lastName.charAt(0) || ''
        return (first + last).toUpperCase()
    }

    return (
        <nav className="h-[80px] w-full px-[120px] bg-white border-b border-light-gray flex items-center justify-between sticky top-0 z-50">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-0">
                <span className="font-heading font-bold text-[24px] text-navy">Cofactor</span>
                <span className="font-heading font-bold text-[24px] text-teal">Scout</span>
            </Link>

            {/* Authenticated Nav Links */}
            {user && (
                <div className="absolute left-[400px]">
                    <Link
                        href="/dashboard"
                        className={cn(
                            "font-heading font-medium text-[16px] transition-colors",
                            pathname === '/dashboard' || pathname?.startsWith('/dashboard')
                                ? "text-navy underline decoration-2 underline-offset-4 decoration-teal"
                                : "text-navy hover:text-teal"
                        )}
                    >
                        My Submissions
                    </Link>
                </div>
            )}

            {/* Right Section */}
            <div className="flex items-center">
                {user ? (
                    <div className="flex items-center gap-4 relative">
                        {/* Name + Badge */}
                        <div className="flex flex-col items-end">
                            <span className="font-heading font-medium text-[14px] text-navy">
                                {user.fullName}
                            </span>
                            <span className="font-heading font-normal text-[12px] text-cool-gray">
                                {user.role === 'SCOUT' ? 'Verified Scout' :
                                    user.role === 'ADMIN' ? 'Administrator' : 'Community Contributor'}
                            </span>
                        </div>

                        {/* Avatar */}
                        <div
                            className="relative cursor-pointer"
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                        >
                            <Avatar
                                src={user.profilePictureUrl}
                                initials={getInitials(user)}
                                size="md"
                            />
                        </div>

                        {/* Dropdown */}
                        <ProfileDropdown
                            user={user}
                            isOpen={isProfileOpen}
                            onClose={() => setIsProfileOpen(false)}
                        />
                    </div>
                ) : (
                    <div className="flex items-center gap-4">
                        <Link href="/auth/signup">
                            <Button variant="secondary" className="w-[120px] h-[40px]">
                                Sign Up
                            </Button>
                        </Link>
                        <Link href="/auth/signin">
                            <Button variant="primary" className="w-[120px] h-[40px]">
                                Sign In
                            </Button>
                        </Link>
                    </div>
                )}
            </div>
        </nav>
    )
}
