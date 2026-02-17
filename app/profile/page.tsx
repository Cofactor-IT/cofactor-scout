import { prisma } from '@/lib/database/prisma'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Settings } from 'lucide-react'
import Link from 'next/link'
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/config"
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function ProfilePage() {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
        redirect('/auth/signin')
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id }
    })

    if (!user) {
        redirect('/auth/signin')
    }

    return (
        <div className="container mx-auto py-10">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-4xl font-bold">My Profile</h1>
                <Link href="/profile/settings">
                    <Button variant="outline">
                        <Settings className="h-4 w-4 mr-2" /> Settings
                    </Button>
                </Link>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Scout Profile Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>Scout Profile</CardTitle>
                        <CardDescription>Your research scout information.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div>
                                <Label>University</Label>
                                <p className="text-sm">{user.university || 'Not specified'}</p>
                            </div>
                            <div>
                                <Label>Department</Label>
                                <p className="text-sm">{user.department || 'Not specified'}</p>
                            </div>
                            <div>
                                <Label>Research Areas</Label>
                                <p className="text-sm">{user.researchAreas || 'Not specified'}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Submission Stats Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>Submission Stats</CardTitle>
                        <CardDescription>Your research lead contributions.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-sm">Total Submissions</span>
                                <Badge variant="outline">{user.totalSubmissions}</Badge>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm">Pending Review</span>
                                <Badge variant="secondary">{user.pendingSubmissions}</Badge>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm">Approved</span>
                                <Badge variant="default">{user.approvedSubmissions}</Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
