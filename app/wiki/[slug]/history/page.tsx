import { prisma } from '@/lib/database/prisma'
import { getHistory, rollbackToRevision } from '@/actions/wiki-history.actions'
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/config"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function HistoryPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    const session = await getServerSession(authOptions)

    // Authorization: Ideally only members can see history? Or public?
    // Let's keep it open but restrict actions.

    const uniPage = await prisma.uniPage.findUnique({
        where: { slug }
    })

    // Strict Authorization Check: Only Admin/Staff can view full history
    const isAdmin = session?.user?.role === 'ADMIN' || session?.user?.role === 'STAFF'

    if (!isAdmin) {
        return (
            <div className="container mx-auto py-10">
                <Card className="max-w-md mx-auto border-destructive/50 bg-destructive/5">
                    <CardHeader>
                        <CardTitle className="text-destructive">Access Denied</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>Only administrators can view revision history.</p>
                        <div className="mt-4">
                            <Link href={`/wiki/${slug}`}>
                                <Button variant="outline">Back to Article</Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (!uniPage) {
        return (
            <div className="container mx-auto py-10">
                <Card>
                    <CardHeader>
                        <CardTitle>Page Not Found</CardTitle>
                    </CardHeader>
                </Card>
            </div>
        )
    }

    const revisions = await prisma.wikiRevision.findMany({
        where: { uniPageId: uniPage.id },
        orderBy: { createdAt: 'desc' },
        include: {
            author: {
                select: {
                    name: true,
                    email: true,
                }
            }
        }
    })

    const currentRevision = revisions.find(r => r.status === 'APPROVED')
    const currentRevisionId = currentRevision ? currentRevision.id : null



    return (
        <div className="container mx-auto py-10">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <Link href={`/wiki/${slug}`} className="text-sm text-muted-foreground hover:underline mb-2 block">
                        &larr; Back to Page
                    </Link>
                    <h1 className="text-3xl font-bold">Revision History: {uniPage.name}</h1>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Revisions ({revisions.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {revisions.map((rev) => (
                            <div key={rev.id} className="flex flex-col sm:flex-row justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        {(rev as any).title || uniPage.name}
                                        <Badge variant={
                                            rev.status === 'APPROVED' ? 'default' :
                                                rev.status === 'PENDING' ? 'secondary' :
                                                    'destructive'
                                        }>
                                            {rev.status}
                                        </Badge>
                                        {rev.id === currentRevisionId && <Badge variant="outline">Current</Badge>}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        Edited by <span className="font-medium text-foreground">{rev.author.name || 'Unknown'}</span> • {new Date(rev.createdAt).toLocaleString()}
                                    </div>
                                    {rev.moderationReason && (
                                        <div className="text-xs text-muted-foreground bg-muted p-2 rounded mt-2">
                                            Note: {rev.moderationReason}
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center gap-2 mt-4 sm:mt-0">
                                    {/* View Revision Content Link - Future feature */}
                                    {/* <Button variant="ghost" size="sm">View</Button> */}

                                    {isAdmin && rev.status !== 'PENDING' && (
                                        <form action={async () => {
                                            'use server'
                                            // We need to bind the ID, but inline server actions are tricky with scope.
                                            // Better to use imported action with bind.

                                            // Re-importing inside server action scope or calling the imported one directly?
                                            // Importing at top level works for server components.
                                            const { rollbackToRevision } = await import('@/actions/wiki-history.actions')
                                            await rollbackToRevision(rev.id)
                                            redirect(`/wiki/${slug}`)
                                        }}>
                                            <Button type="submit" variant="outline" size="sm">
                                                Rollback to this
                                            </Button>
                                        </form>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
