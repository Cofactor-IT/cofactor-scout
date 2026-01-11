import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-config"
import { redirect } from 'next/navigation'
import { User } from '@prisma/client'
import { SocialStats } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function MembersPage() {
    // Admin only access
    const session = await getServerSession(authOptions)
    if (!session?.user?.role || session.user.role !== 'ADMIN') {
        redirect('/api/auth/signin?error=AccessDenied')
    }

    const members = await prisma.user.findMany({
        orderBy: { powerScore: 'desc' },
        include: {
            _count: {
                select: {
                    referralsMade: true,
                    revisions: { where: { status: 'APPROVED' } }
                }
            }
        }
    })

    return (
        <div className="container mx-auto py-10">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-4xl font-bold">Members Directory</h1>
                    <p className="text-muted-foreground mt-2">
                        Admin view of all {members.length} members and their contributions.
                    </p>
                </div>
                <Link href="/leaderboard">
                    <Button variant="outline">View Leaderboard</Button>
                </Link>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {members.map((member: User & { _count: { referralsMade: number, revisions: number } }, index: number) => {
                    const socialStats = (member.socialStats as SocialStats | null) || {}

                    return (
                        <Card key={member.id} className="overflow-hidden">
                            <CardHeader className="pb-3">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="text-xl">
                                            {member.name || 'Anonymous'}
                                        </CardTitle>
                                        <p className="text-sm text-muted-foreground">
                                            {member.email}
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <Badge variant={
                                            member.role === 'ADMIN' ? 'destructive' :
                                                member.role === 'STAFF' ? 'default' :
                                                    'secondary'
                                        }>
                                            {member.role}
                                        </Badge>
                                        <span className="text-xs text-muted-foreground">
                                            #{index + 1}
                                        </span>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Power Score */}
                                <div className="flex justify-between items-center p-3 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg">
                                    <span className="text-sm font-medium">Power Score</span>
                                    <span className="text-2xl font-bold text-purple-500">
                                        {member.powerScore}
                                    </span>
                                </div>

                                {/* Contributions */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="p-3 border rounded-lg text-center">
                                        <div className="text-2xl font-bold text-green-500">
                                            {member._count.referralsMade}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            Referrals
                                        </div>
                                    </div>
                                    <div className="p-3 border rounded-lg text-center">
                                        <div className="text-2xl font-bold text-blue-500">
                                            {member._count.revisions}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            Wiki Edits
                                        </div>
                                    </div>
                                </div>

                                {/* Social Stats - Clickable Links */}
                                {(socialStats.instagramUsername || socialStats.tiktokUsername || socialStats.linkedinUrl) && (
                                    <div className="space-y-2">
                                        <p className="text-xs font-medium text-muted-foreground uppercase">
                                            Social Accounts
                                        </p>
                                        <div className="space-y-1">
                                            {socialStats.instagramUsername && (
                                                <a
                                                    href={`https://instagram.com/${socialStats.instagramUsername}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex justify-between items-center p-2 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded text-sm hover:from-purple-500/20 hover:to-pink-500/20 transition-colors"
                                                >
                                                    <span>📷 @{socialStats.instagramUsername}</span>
                                                    <span className="font-semibold">{socialStats.instagram || 0}</span>
                                                </a>
                                            )}
                                            {socialStats.tiktokUsername && (
                                                <a
                                                    href={`https://tiktok.com/@${socialStats.tiktokUsername}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex justify-between items-center p-2 bg-black/20 rounded text-sm hover:bg-black/30 transition-colors"
                                                >
                                                    <span>🎵 @{socialStats.tiktokUsername}</span>
                                                    <span className="font-semibold">{socialStats.tiktok || 0}</span>
                                                </a>
                                            )}
                                            {socialStats.linkedinUrl && (
                                                <a
                                                    href={socialStats.linkedinUrl.startsWith('http') ? socialStats.linkedinUrl : `https://${socialStats.linkedinUrl}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex justify-between items-center p-2 bg-blue-500/10 rounded text-sm hover:bg-blue-500/20 transition-colors"
                                                >
                                                    <span>💼 LinkedIn</span>
                                                    <span className="font-semibold">{socialStats.linkedin || 0}</span>
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Referral Code */}
                                <div className="pt-2 border-t">
                                    <p className="text-xs text-muted-foreground">
                                        Referral Code: <code className="font-mono bg-muted px-1 rounded">{member.referralCode}</code>
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>
        </div>
    )
}
