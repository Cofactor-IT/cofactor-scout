import { prisma } from '@/lib/database/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { redirect } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { ChangePasswordForm } from '@/components/features/profile/ChangePasswordForm'
import { EditProfileForm } from '@/components/features/profile/EditProfileForm'
import { PublicProfileSettings } from '@/components/features/profile/PublicProfileSettings'
import { getInstitutesForUser } from '../settings-actions'

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
        redirect('/auth/signin')
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: {
            publicPerson: true
        }
    })

    if (!user) {
        redirect('/auth/signin')
    }

    // Fetch institutes for public profile selection
    const institutes = await getInstitutesForUser()

    return (
        <div className="container mx-auto py-10 max-w-3xl">
            <div className="mb-8">
                <Link href="/profile">
                    <Button variant="ghost" className="mb-4">
                        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Profile
                    </Button>
                </Link>
                <h1 className="text-4xl font-bold">Settings</h1>
                <p className="text-muted-foreground mt-2">Manage your account and profile settings</p>
            </div>

            <div className="space-y-6">
                {/* Edit Profile Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>Profile Information</CardTitle>
                        <CardDescription>Update your display name and bio</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <EditProfileForm
                            initialName={user.name || ''}
                            initialBio={user.bio}
                        />
                    </CardContent>
                </Card>

                {/* Change Password Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>Change Password</CardTitle>
                        <CardDescription>Update your account password</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChangePasswordForm />
                    </CardContent>
                </Card>

                {/* Public Profile Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>Public Profile</CardTitle>
                        <CardDescription>
                            Control your visibility. When enabled, you can be tagged in wiki articles and others can see your profile.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <PublicProfileSettings
                            isPublic={user.isPublicProfile}
                            publicProfile={user.publicPerson}
                            institutes={institutes}
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
