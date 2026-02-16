import { prisma } from '@/lib/database/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/config"
import { redirect } from 'next/navigation'
import { saveSocialApiKeys } from '@/actions/social-connect.actions'
import { SocialStats } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function SocialConnectPage() {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
        redirect('/api/auth/signin')
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email }
    })

    if (!user) {
        redirect('/api/auth/signin')
    }

    const socialStats = (user.socialStats as SocialStats | null) || {}

    return (
        <div className="container mx-auto py-10 max-w-2xl">
            <h1 className="text-4xl font-bold mb-2">Connect Social Accounts</h1>
            <p className="text-muted-foreground mb-8">
                Link your social media accounts and enter your follower count to boost your Power Score.
            </p>

            <div className="space-y-6">
                {/* Instagram */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <span className="text-pink-500">📷</span> Instagram
                            </CardTitle>
                            {socialStats.instagramUsername ? (
                                <Badge variant="default">Connected</Badge>
                            ) : (
                                <Badge variant="secondary">Not Connected</Badge>
                            )}
                        </div>
                        {socialStats.instagramUsername && (
                            <p className="text-sm text-muted-foreground">
                                @{socialStats.instagramUsername} • {socialStats.instagram || 0} followers
                            </p>
                        )}
                    </CardHeader>
                    <CardContent>
                        <form action={saveSocialApiKeys} className="space-y-4">
                            <input type="hidden" name="platform" value="instagram" />
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="instagram_username">Username</Label>
                                    <Input
                                        id="instagram_username"
                                        name="username"
                                        placeholder="yourusername"
                                        defaultValue={socialStats.instagramUsername || ''}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="instagram_followers">Followers</Label>
                                    <Input
                                        id="instagram_followers"
                                        name="followers"
                                        type="number"
                                        placeholder="10000"
                                        defaultValue={socialStats.instagram || ''}
                                    />
                                </div>
                            </div>
                            <Button type="submit" className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                                Save Instagram
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* TikTok */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <span>🎵</span> TikTok
                            </CardTitle>
                            {socialStats.tiktokUsername ? (
                                <Badge variant="default">Connected</Badge>
                            ) : (
                                <Badge variant="secondary">Not Connected</Badge>
                            )}
                        </div>
                        {socialStats.tiktokUsername && (
                            <p className="text-sm text-muted-foreground">
                                @{socialStats.tiktokUsername} • {socialStats.tiktok || 0} followers
                            </p>
                        )}
                    </CardHeader>
                    <CardContent>
                        <form action={saveSocialApiKeys} className="space-y-4">
                            <input type="hidden" name="platform" value="tiktok" />
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="tiktok_username">Username</Label>
                                    <Input
                                        id="tiktok_username"
                                        name="username"
                                        placeholder="yourusername"
                                        defaultValue={socialStats.tiktokUsername || ''}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="tiktok_followers">Followers</Label>
                                    <Input
                                        id="tiktok_followers"
                                        name="followers"
                                        type="number"
                                        placeholder="50000"
                                        defaultValue={socialStats.tiktok || ''}
                                    />
                                </div>
                            </div>
                            <Button type="submit" className="w-full bg-black hover:bg-gray-800">
                                Save TikTok
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* LinkedIn */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <span className="text-blue-600">💼</span> LinkedIn
                            </CardTitle>
                            {socialStats.linkedinUrl ? (
                                <Badge variant="default">Connected</Badge>
                            ) : (
                                <Badge variant="secondary">Not Connected</Badge>
                            )}
                        </div>
                        {socialStats.linkedinUrl && (
                            <p className="text-sm text-muted-foreground">
                                {socialStats.linkedinUrl} • {socialStats.linkedin || 0} connections
                            </p>
                        )}
                    </CardHeader>
                    <CardContent>
                        <form action={saveSocialApiKeys} className="space-y-4">
                            <input type="hidden" name="platform" value="linkedin" />
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="linkedin_url">Profile URL</Label>
                                    <Input
                                        id="linkedin_url"
                                        name="username"
                                        placeholder="linkedin.com/in/you"
                                        defaultValue={socialStats.linkedinUrl || ''}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="linkedin_followers">Connections</Label>
                                    <Input
                                        id="linkedin_followers"
                                        name="followers"
                                        type="number"
                                        placeholder="500"
                                        defaultValue={socialStats.linkedin || ''}
                                    />
                                </div>
                            </div>
                            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                                Save LinkedIn
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <p className="text-xs text-muted-foreground text-center">
                    Follower counts may be verified by admins. Misrepresentation may result in score adjustments.
                </p>
            </div>
        </div>
    )
}
