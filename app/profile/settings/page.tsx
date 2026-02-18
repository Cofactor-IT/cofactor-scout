import { prisma } from '@/lib/database/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { redirect } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
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
                <Card>
                    <CardHeader>
                        <CardTitle>Profile Settings</CardTitle>
                        <CardDescription>Manage your profile information</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">Profile settings coming soon.</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
