'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useSession, signOut } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'

export function Navbar() {
    const { data: session, status } = useSession()
    const [mounted, setMounted] = useState(false)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true)
    }, [])

    const user = session?.user
    const isAdmin = user?.role === 'ADMIN'

    // Render a placeholder navbar to prevent blank screen
    if (!mounted) {
        return (
            <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container flex h-14 items-center">
                    <div className="mr-4 flex">
                        <span className="mr-6 flex items-center space-x-2 font-bold text-xl">
                            Cofactor Club
                        </span>
                    </div>
                    <div className="flex flex-1 items-center justify-end">
                        <div className="h-8 w-20 animate-pulse bg-muted rounded" />
                    </div>
                </div>
            </nav>
        )
    }

    return (
        <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 items-center">
                {/* Mobile menu button */}
                <button
                    className="md:hidden mr-2 p-2 rounded-md hover:bg-accent"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    aria-label="Toggle menu"
                >
                    {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>

                {/* Logo and desktop nav */}
                <div className="mr-4 flex">
                    <Link href="/" className="mr-6 flex items-center space-x-2 font-bold text-xl">
                        Cofactor Club
                    </Link>
                    <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
                        <Link href="/leaderboard" className="transition-colors hover:text-foreground/80 text-foreground/60">Leaderboard</Link>
                        <Link href="/wiki" className="transition-colors hover:text-foreground/80 text-foreground/60">Wiki</Link>
                    </nav>
                </div>

                {/* Desktop user actions */}
                <div className="flex flex-1 items-center justify-end space-x-2">
                    <nav className="flex items-center space-x-2">
                        {status === 'loading' ? (
                            <div className="h-8 w-20 animate-pulse bg-muted rounded" />
                        ) : !user ? (
                            <>
                                <Link href="/auth/signin">
                                    <Button variant="ghost" size="sm">Sign In</Button>
                                </Link>
                                <Link href="/auth/signup" className="hidden sm:inline">
                                    <Button size="sm">Sign Up</Button>
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link href="/members" className="hidden md:inline">
                                    <Button variant="ghost" size="sm">Members</Button>
                                </Link>
                                {isAdmin && (
                                    <Link href="/admin/dashboard" className="hidden md:inline">
                                        <Button variant="ghost" size="sm">Admin</Button>
                                    </Link>
                                )}
                                <div className="flex items-center space-x-2 border-l pl-2 ml-2">
                                    <Link href="/profile" className="text-sm font-medium hidden sm:inline hover:underline">
                                        {user.name || user.email}
                                    </Link>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => signOut({ callbackUrl: '/' })}
                                    >
                                        Sign Out
                                    </Button>
                                </div>
                            </>
                        )}
                    </nav>
                </div>
            </div>

            {/* Mobile menu overlay */}
            {mobileMenuOpen && (
                <div className="md:hidden border-t bg-background">
                    <div className="container py-4 space-y-3">
                        <Link
                            href="/leaderboard"
                            className="block py-2 text-foreground/80 hover:text-foreground"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            Leaderboard
                        </Link>
                        <Link
                            href="/wiki"
                            className="block py-2 text-foreground/80 hover:text-foreground"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            Wiki
                        </Link>
                        {user && (
                            <>
                                <Link
                                    href="/members"
                                    className="block py-2 text-foreground/80 hover:text-foreground"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Members
                                </Link>
                                {isAdmin && (
                                    <Link
                                        href="/admin/dashboard"
                                        className="block py-2 text-foreground/80 hover:text-foreground"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        Admin Dashboard
                                    </Link>
                                )}
                                <Link
                                    href="/profile"
                                    className="block py-2 text-foreground/80 hover:text-foreground"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Profile
                                </Link>
                            </>
                        )}
                        {!user && (
                            <Link
                                href="/auth/signup"
                                className="block py-2 text-foreground/80 hover:text-foreground"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Sign Up
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </nav>
    )
}

