'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useSession, signOut } from 'next-auth/react'
import { useEffect, useState } from 'react'

export function Navbar() {
    const { data: session, status } = useSession()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true)
    }, [])

    if (!mounted) {
        return null // Avoid hydration mismatch
    }

    const user = session?.user
    const isAdmin = user?.role === 'ADMIN'

    return (
        <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 items-center">
                <div className="mr-4 hidden md:flex">
                    <Link href="/" className="mr-6 flex items-center space-x-2 font-bold text-xl">
                        Cofactor Club
                    </Link>
                    <nav className="flex items-center space-x-6 text-sm font-medium">
                        <Link href="/leaderboard" className="transition-colors hover:text-foreground/80 text-foreground/60">Leaderboard</Link>
                        <Link href="/wiki" className="transition-colors hover:text-foreground/80 text-foreground/60">Wiki</Link>
                    </nav>
                </div>
                <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
                    <div className="w-full flex-1 md:w-auto md:flex-none">
                        {/* Search could go here */}
                    </div>
                    <nav className="flex items-center space-x-2">
                        {status === 'loading' ? (
                            <div className="h-8 w-20 animate-pulse bg-muted rounded" />
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
                                <Link href="/profile">
                                    <Button variant="ghost" size="sm">Profile</Button>
                                </Link>
                                <Link href="/members">
                                    <Button variant="ghost" size="sm">Members</Button>
                                </Link>
                                {isAdmin && (
                                    <Link href="/admin/dashboard">
                                        <Button variant="ghost" size="sm">Admin</Button>
                                    </Link>
                                )}
                                <div className="flex items-center space-x-2 border-l pl-2 ml-2">
                                    <span className="text-sm font-medium hidden sm:inline">
                                        {user.name || user.email}
                                    </span>
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
        </nav>
    )
}
