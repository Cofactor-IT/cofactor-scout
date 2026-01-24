import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import { SocialStats } from '@/lib/types'
import Link from 'next/link'
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-config"
import { redirect } from 'next/navigation'
import { SecondaryUniversityCard } from './SecondaryUniversityCard'

export const dynamic = 'force-dynamic'

export default async function ProfilePage() {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
        redirect('/auth/signin')
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: {
            university: true,
            secondaryUniversity: true
        }
    })

    if (!user) {
        redirect('/auth/signin')
    }

    // Fetch all approved universities for the dropdown
    const universities = await prisma.university.findMany({
        where: { approved: true },
        orderBy: { name: 'asc' },
        select: {
            id: true,
            name: true
        }
    })

    // Fetch pending secondary university request
    const pendingRequest = await prisma.secondaryUniversityRequest.findFirst({
        where: {
            userId: user.id,
            status: 'PENDING'
        },
        include: {
            university: {
                select: { name: true }
            }
        }
    })

    const socialStats = (user.socialStats as SocialStats) || {}

    return (
        <div className="container mx-auto py-10">
            <h1 className="text-4xl font-bold mb-8">My Profile</h1>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Primary University Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>Primary University</CardTitle>
                        <CardDescription>Your main academic affiliation.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {user.university ? (
                            <div className="space-y-2">
                                <p className="text-lg font-medium">{user.university.name}</p>
                                {!user.university.approved && (
                                    <p className="text-sm text-yellow-600 dark:text-yellow-400">
                                        Pending admin approval
                                    </p>
                                )}
                            </div>
                        ) : (
                            <p className="text-muted-foreground">Not affiliated with a university</p>
                        )}
                    </CardContent>
                </Card>

                {/* Secondary University Card */}
                <SecondaryUniversityCard
                    universities={universities}
                    primaryUniversityId={user.universityId}
                    secondaryUniversity={user.secondaryUniversity}
                    pendingRequest={pendingRequest}
                />

                <Card>
                    <CardHeader>
                        <CardTitle>Referral Program</CardTitle>
                        <CardDescription>Share your unique code to earn points.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Your Referral Code</Label>
                            <div className="flex gap-2">
                                <Input readOnly value={user.referralCode} className="font-mono text-lg bg-muted" />
                                <Button variant="outline" className="shrink-0">Copy</Button>
                            </div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Earn 50 points for every student who joins using your code.
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Social Reach</CardTitle>
                        <CardDescription>Connect your accounts to boost your Power Score.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-3 gap-2 text-center">
                            <div className="p-2 border rounded">
                                <div className="text-xs text-muted-foreground uppercase">Instagram</div>
                                <div className="font-bold">{socialStats.instagram || 0}</div>
                            </div>
                            <div className="p-2 border rounded">
                                <div className="text-xs text-muted-foreground uppercase">TikTok</div>
                                <div className="font-bold">{socialStats.tiktok || 0}</div>
                            </div>
                            <div className="p-2 border rounded">
                                <div className="text-xs text-muted-foreground uppercase">LinkedIn</div>
                                <div className="font-bold">{socialStats.linkedin || 0}</div>
                            </div>
                        </div>

                        <Link href="/profile/connect">
                            <Button className="w-full">Connect Accounts</Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
