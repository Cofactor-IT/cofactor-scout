'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useSession, signOut } from 'next-auth/react'
import { useState, useSyncExternalStore } from 'react'
import { SearchBar } from '@/components/features/search/SearchBar'
import { Menu, X } from 'lucide-react'

function useIsClient() {
    return useSyncExternalStore(
        () => () => { },
        () => true,
        () => false
    )
}

export function Navbar() {
    const { data: session, status } = useSession()
    const mounted = useIsClient()
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    if (!mounted) {
        return null
    }

    const user = session?.user
    const isAdmin = user?.role === 'ADMIN'

    return (
        <nav className="border-b border-light-gray bg-white h-20">
            <div className="container flex h-full items-center px-[120px]">
                {/* Mobile Menu Toggle */}
                <div className="md:hidden mr-2">
                    <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                        {isMobileMenuOpen ? <X /> : <Menu />}
                    </Button>
                </div>

                {/* Logo and Desktop Nav */}
                <div className="mr-4 flex items-center">
                    <Link href="/" className="mr-6 flex items-center space-x-2 font-bold font-sans text-xl text-navy">
                        Cofactor <span className="text-teal">Scout</span>
                    </Link>
                    <nav className="hidden md:flex items-center space-x-6 text-base font-medium font-sans">
                        <Link href="/search" className="transition-colors hover:text-teal text-navy">Search</Link>
                    </nav>
                </div>
                <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
                    <nav className="flex items-center space-x-2">
                        <SearchBar />
                        {status === 'loading' ? (
                            <div className="h-8 w-20 animate-pulse bg-light-gray rounded-pill" />
                        ) : !user ? (
                            <>
                                <Link href="/auth/signin">
                                    <Button variant="ghost" size="sm">Sign In</Button>
                                </Link>
                                <Link href="/auth/signup">
                                    <Button size="sm">Sign Up</Button>
                                </Link>
                            </>
                        ) : (
                            <>

                                {isAdmin && (
                                    <>
                                        <Link href="/members">
                                            <Button variant="ghost" size="sm">Members</Button>
                                        </Link>
                                        <Link href="/admin/dashboard">
                                            <Button variant="ghost" size="sm">Admin</Button>
                                        </Link>
                                    </>
                                )}
                                <div className="flex items-center space-x-2 border-l border-light-gray pl-2 ml-2">
                                    <Link href="/profile" className="text-sm font-medium font-sans text-navy hidden sm:inline hover:text-teal">
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


            {/* Mobile Menu Overlay */}
            {
                isMobileMenuOpen && (
                    <div className="md:hidden absolute top-20 left-0 w-full bg-white border-b border-light-gray shadow-md p-4 flex flex-col space-y-4 z-50 animate-in slide-in-from-top-2">
                        <Link
                            href="/search"
                            className="text-base font-medium font-sans transition-colors hover:text-teal text-navy"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            Search
                        </Link>
                        {isAdmin && (
                            <>
                                <Link
                                    href="/members"
                                    className="text-base font-medium font-sans transition-colors hover:text-teal text-navy"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    Members
                                </Link>
                                <Link
                                    href="/admin/dashboard"
                                    className="text-base font-medium font-sans transition-colors hover:text-teal text-navy"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    Admin Dashboard
                                </Link>
                            </>
                        )}
                    </div>
                )
            }
        </nav >
    )
}

