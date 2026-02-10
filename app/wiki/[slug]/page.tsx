import { prisma } from '@/lib/prisma'
import { unstable_cache } from 'next/cache'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-config"
import { WikiRevision } from '@prisma/client'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'

export default async function WikiPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    const session = await getServerSession(authOptions)

    // Cache the wiki page data
    const getCachedWikiPage = unstable_cache(
        async (slug: string) => {
            return prisma.uniPage.findUnique({
                where: { slug },
                include: {
                    revisions: {
                        orderBy: { createdAt: 'desc' },
                        take: 5
                    }
                }
            })
        },
        ['wiki-page'],
        {
            tags: [`wiki-${slug}`],
            revalidate: 3600 // 1 hour
        }
    )

    const uniPage = await getCachedWikiPage(slug)

    // Access Control Check
    if (uniPage && uniPage.universityId) {
        if (session?.user?.role === 'STUDENT') {
            // We need to check the user's universityId. 
            // Session might not have it, so let's fetch user or trust session if we added it to session callback.
            // Safer to fetch user here or assume session update. 
            // Let's fetch for now to be 100% secure.
            const user = await prisma.user.findUnique({
                where: { email: session.user.email! },
                select: { universityId: true }
            })

            if (user?.universityId !== uniPage.universityId) {
                return (
                    <div className="container mx-auto py-10">
                        <Card className="max-w-2xl mx-auto text-center p-10 border-destructive">
                            <CardTitle className="text-3xl mb-4 text-destructive">Access Denied</CardTitle>
                            <p className="text-muted-foreground mb-6">
                                This wiki page belongs to another university. You do not have permission to view it.
                            </p>
                            <Link href="/wiki">
                                <Button>Return to Wiki</Button>
                            </Link>
                        </Card>
                    </div>
                )
            }
        }
    }

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

    const isPublished = uniPage.published
    const pendingRevisions = uniPage.revisions.filter((r: WikiRevision) => r.status === 'PENDING')
    const hasPendingRevisions = pendingRevisions.length > 0

    // Draft/Unpublished State
    if (!isPublished) {
        return (
            <div className="container mx-auto py-10">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-4">
                        <h1 className="text-4xl font-bold">{uniPage.name}</h1>
                        <Badge variant="secondary" className="text-sm">
                            {hasPendingRevisions ? 'Pending Review' : 'Draft'}
                        </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                        {session?.user?.role === 'ADMIN' && (
                            <form action={async () => {
                                'use server'
                                const { deletePage } = await import('@/app/admin/actions')
                                await deletePage(slug)
                            }}>
                                <Button variant="destructive" size="sm">Delete Page</Button>
                            </form>
                        )}
                        <Link href={`/wiki/${slug}/edit`}>
                            <Button variant="outline">Edit Page</Button>
                        </Link>
                    </div>
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
                                ? `There are ${pendingRevisions.length} revision(s) currently awaiting moderation.`
                                : 'This page is blank. Be the first to contribute!'}
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

    // Published page with content
    return (
        <div className="container mx-auto py-10">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                    <h1 className="text-4xl font-bold">{uniPage.name}</h1>
                    {hasPendingRevisions && (
                        <Link href="/admin/dashboard">
                            <Badge variant="outline" className="text-xs hover:bg-muted cursor-pointer">
                                {pendingRevisions.length} pending update{pendingRevisions.length > 1 ? 's' : ''}
                            </Badge>
                        </Link>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {session?.user?.role === 'ADMIN' && (
                        <form action={async () => {
                            'use server'
                            const { deletePage } = await import('@/app/admin/actions')
                            await deletePage(slug)
                        }}>
                            <Button variant="destructive" size="sm">Delete Page</Button>
                        </form>
                    )}
                    {/* HISTORY BUTTON - ADMIN/STAFF ONLY */}
                    {(session?.user?.role === 'ADMIN' || session?.user?.role === 'STAFF') && (
                        <Link href={`/wiki/${slug}/history`}>
                            <Button variant="ghost">History</Button>
                        </Link>
                    )}
                    <Link href={`/wiki/${slug}/edit`}>
                        <Button variant="outline">Edit Page</Button>
                    </Link>
                </div>
            </div>

            <Card>
                <CardContent className="pt-6 p-8">
                    <div className="prose dark:prose-invert max-w-none">
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            rehypePlugins={[rehypeRaw]}
                        >
                            {uniPage.content}
                        </ReactMarkdown>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
