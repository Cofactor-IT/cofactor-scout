import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

export default async function WikiPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
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

    // Show pending/draft notice if no approved content
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

                <Card className="border-dashed border-2 border-muted">
                    <CardHeader className="text-center">
                        <CardTitle className="text-xl text-muted-foreground">
                            {hasPendingRevisions ? '📝 Content Pending Review' : '📄 No Content Yet'}
                        </CardTitle>
                        <CardDescription>
                            {hasPendingRevisions
                                ? `This page has ${pendingRevisions.length} revision${pendingRevisions.length > 1 ? 's' : ''} awaiting moderator approval.`
                                : 'This page is empty. Be the first to contribute!'
                            }
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="text-center">
                        {!hasPendingRevisions && (
                            <Link href={`/wiki/${slug}/edit`}>
                                <Button size="lg">Add Content</Button>
                            </Link>
                        )}
                        {hasPendingRevisions && (
                            <p className="text-sm text-muted-foreground">
                                Check back soon! Moderators typically review submissions within 24 hours.
                            </p>
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
                        <Badge variant="outline" className="text-xs">
                            {pendingRevisions.length} pending update{pendingRevisions.length > 1 ? 's' : ''}
                        </Badge>
                    )}
                </div>
                <Link href={`/wiki/${slug}/edit`}>
                    <Button variant="outline">Edit Page</Button>
                </Link>
            </div>

            <Card>
                <CardContent className="prose dark:prose-invert max-w-none pt-6">
                    {/* In a real app, use a markdown renderer here */}
                    <div className="whitespace-pre-wrap">{uniPage.content}</div>
                </CardContent>
            </Card>
        </div>
    )
}
