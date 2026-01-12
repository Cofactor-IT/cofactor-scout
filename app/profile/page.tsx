import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { syncSocials } from '../actions/social'
import { SocialStats } from '@/lib/types'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function ProfilePage() {
    let user = await prisma.user.findFirst()

    if (!user) {
        // Auto-create for demo if missing
        user = await prisma.user.create({
            data: {
                email: 'student@cofactor.world',
                referralCode: 'STUDENT1',
                role: 'STUDENT',
                name: 'Demo Student'
            }
        })
    }

    const socialStats = (user.socialStats as SocialStats) || {}

    return (
        <div className="container mx-auto py-10">
            <h1 className="text-4xl font-bold mb-8">My Profile</h1>

            <div className="grid gap-6 md:grid-cols-2">
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

                        <div className="flex gap-2">
                            <form action={syncSocials}>
                                <Button variant="outline" className="flex-1">Sync Stats</Button>
                            </form>
                            <Link href="/profile/connect">
                                <Button className="flex-1">Connect Accounts</Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
