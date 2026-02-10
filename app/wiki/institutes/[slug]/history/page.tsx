import { prisma } from '@/lib/prisma'
import { getRecentActivity } from '@/app/wiki/activity-actions'
import { ActivityTimeline } from '@/components/wiki/ActivityTimeline'
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-config"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from 'next/link'

export default async function InstituteHistoryPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    const session = await getServerSession(authOptions)

    const institute = await prisma.institute.findUnique({
        where: { slug }
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
                            <Link href={`/wiki/institutes/${slug}`}>
                                <Button variant="outline">Back to Institute</Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (!institute) {
        return (
            <div className="container mx-auto py-10">
                <p>Institute not found.</p>
            </div>
        )
    }

    const activity = await getRecentActivity({ instituteId: institute.id })

    return (
        <div className="container mx-auto py-10">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <Link href={`/wiki/institutes/${slug}`} className="text-sm text-muted-foreground hover:underline mb-2 block">
                        &larr; Back to {institute.name}
                    </Link>
                    <h1 className="text-3xl font-bold">Activity Log: {institute.name}</h1>
                </div>
            </div>

            <ActivityTimeline grouped={activity as any} isAdmin={isAdmin} />
        </div>
    )
}
