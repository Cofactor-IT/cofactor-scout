import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-config"

export default async function WikiPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    const session = await getServerSession(authOptions)

    const uniPage = await prisma.uniPage.findUnique({
        where: { slug },
        include: {
            revisions: {
                orderBy: { createdAt: 'desc' },
                take: 5
            }
        }
    })

    // Page doesn't exist at all
    if (!uniPage) {
        return (
            <div className="container mx-auto py-10">
                <Card className="max-w-2xl mx-auto text-center p-10">
                    <CardTitle className="text-3xl mb-4">Page Not Found</CardTitle>
                    <p className="text-muted-foreground mb-6">
                        The page for <strong>{slug}</strong> does not exist yet.
                    </p>
                    <Link href={`/wiki/${slug}/edit`}>
                        <Button size="lg">Create {slug}</Button>
                    </Link>
                </Card>
            </div>
        )
    }

    // Check if page has no approved content (empty or draft)
    const hasContent = uniPage.content && uniPage.content.trim().length > 0
    const pendingRevisions = uniPage.revisions.filter(r => r.status === 'PENDING')
    const hasPendingRevisions = pendingRevisions.length > 0

    // Explicit Empty State / Draft State UI
    if (!hasContent) {
        return (
            <div className="container mx-auto py-10">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-4">
                        <h1 className="text-4xl font-bold">{uniPage.name}</h1>
                        <Badge variant="secondary" className="text-sm">
                            {hasPendingRevisions ? 'Pending Review' : 'Draft'}
                        </Badge>
                    </div>
                    <Link href={`/wiki/${slug}/edit`}>
                        <Button variant="outline">Edit Page</Button>
                    </Link>
                </div>

                <Card className="border-dashed border-2 border-muted bg-muted/10">
                    <CardHeader className="text-center py-12">
                        <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4 text-2xl">
                            {hasPendingRevisions ? '⏳' : '✍️'}
                        </div>
                        <CardTitle className="text-2xl mb-2">
                            {hasPendingRevisions ? 'Content Pending Review' : 'No Content Yet'}
                        </CardTitle>
                        <CardDescription className="text-lg max-w-md mx-auto">
                            {hasPendingRevisions
                                ? `There are ${pendingRevisions.length} revision(s) currently awaiting moderation. Check back soon!`
                                : 'This page is essentially blank. Be the first to contribute knowledge about this university.'
                            }
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="text-center pb-8">
                        {!hasPendingRevisions && (
                            <Link href={`/wiki/${slug}/edit`}>
                                <Button size="lg" className="px-8">Start Writing</Button>
                            </Link>
                        )}
                        {hasPendingRevisions && (
                            <div className="flex justify-center gap-2">
                                <Link href="/leaderboard">
                                    <Button variant="ghost">View Leaderboard</Button>
                                </Link>
                                {session?.user?.role === 'ADMIN' && (
                                    <Link href="/admin/dashboard">
                                        <Button variant="outline">Review as Admin</Button>
                                    </Link>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        )
    }

    // Normal page with approved content
    return (
        <div className="container mx-auto py-10">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                    <h1 className="text-4xl font-bold">{uniPage.name}</h1>
                    {hasPendingRevisions && (
                        <Link href={`/admin/dashboard`}>
                            <Badge variant="outline" className="text-xs hover:bg-muted cursor-pointer">
                                {pendingRevisions.length} pending update{pendingRevisions.length > 1 ? 's' : ''}
                            </Badge>
                        </Link>
                    )}
                </div>
                <Link href={`/wiki/${slug}/edit`}>
                    <Button variant="outline">Edit Page</Button>
                </Link>
            </div>

            <Card>
                <CardContent className="prose dark:prose-invert max-w-none pt-6 p-8">
                    <div className="whitespace-pre-wrap font-sans">{uniPage.content}</div>
                </CardContent>
            </Card>
        </div>
    )
}
