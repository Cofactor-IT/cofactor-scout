import { prisma } from '@/lib/database/prisma'
import { getRecentActivity } from '@/actions/wiki-activity.actions'
import { ActivityTimeline } from '@/components/wiki/ActivityTimeline'
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/config"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from 'next/link'

export default async function LabHistoryPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    const session = await getServerSession(authOptions)

    const lab = await prisma.lab.findUnique({
        where: { slug },
        include: { institute: true }
    })

    // Authorization
    const isAdmin = session?.user?.role === 'ADMIN' || session?.user?.role === 'STAFF'

    if (!isAdmin) {
        return (
            <div className="container mx-auto py-10">
                <Card className="max-w-md mx-auto border-destructive/50 bg-destructive/5">
                    <CardHeader>
                        <CardTitle className="text-destructive">Access Denied</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>Only administrators can view activity logs.</p>
                        <div className="mt-4">
                            <Link href={`/wiki/labs/${slug}`}>
                                <Button variant="outline">Back to Lab</Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (!lab) {
        return (
            <div className="container mx-auto py-10">
                <p>Lab not found.</p>
            </div>
        )
    }

    const activity = await getRecentActivity({ labId: lab.id })

    return (
        <div className="container mx-auto py-10">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <Link href={`/wiki/labs/${slug}`} className="text-sm text-muted-foreground hover:underline mb-2 block">
                        &larr; Back to {lab.name}
                    </Link>
                    <h1 className="text-3xl font-bold">Activity Log: {lab.name}</h1>
                </div>
            </div>

            <ActivityTimeline grouped={activity as any} isAdmin={isAdmin} />
        </div>
    )
}
