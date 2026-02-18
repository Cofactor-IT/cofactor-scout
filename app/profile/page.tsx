import { prisma } from '@/lib/database/prisma'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Settings } from 'lucide-react'
import Link from 'next/link'
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/config"
import { redirect } from 'next/navigation'
import { SecondaryUniversityCard } from '@/components/features/profile/SecondaryUniversityCard'
import { ProfileLinksForm } from '@/components/features/profile/ProfileLinksForm'

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
                        <CardTitle>Links</CardTitle>
                        <CardDescription>Manage your public links.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ProfileLinksForm
                            initialLinkedin={user.linkedinUrl}
                            initialWebsite={user.websiteUrl}
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
