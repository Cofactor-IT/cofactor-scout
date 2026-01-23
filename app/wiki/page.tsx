import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-config"
import { AddArticleButton } from './AddArticleButton'
import { ProposeStructureModal } from './ProposeStructureModal'

export const dynamic = 'force-dynamic'

export default async function WikiIndexPage({ searchParams }: { searchParams: Promise<{ universityId?: string }> }) {
    const session = await getServerSession(authOptions)
    const userRole = session?.user?.role
    const { universityId } = await searchParams

    // Need to fetch user to get universityId, as it might not be in session depending on config.
    // Assuming we need to fetch user details if not in session. 
    // Usually session doesn't have custom fields unless configured.
    // Let's assume we fetch user to be safe or update session callback?
    // For now, let's fetch user from DB to be sure.
    let userUniversityId: string | null = null;
    let userUniversityName: string | null = null;

    if (session?.user?.email) {
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: { university: true }
        })
        userUniversityId = user?.universityId ?? null
        userUniversityName = user?.university?.name ?? null
    }

    // Admin Folder View Logic
    const isAdmin = userRole === 'ADMIN' || userRole === 'STAFF';
    const showUniversityFolders = isAdmin && !universityId;

    if (showUniversityFolders) {
        // Fetch all universities with page counts
        const universities = await prisma.university.findMany({
            include: {
                _count: {
                    select: { pages: true }
                }
            },
            orderBy: { name: 'asc' }
        });

        return (
            <div className="container mx-auto py-10">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-4xl font-bold">University Wiki Management</h1>
                    <AddArticleButton />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {universities.map((uni) => (
                        <Link key={uni.id} href={`/wiki?universityId=${uni.id}`}>
                            <Card className="hover:bg-muted/50 transition-colors h-full flex flex-col items-center justify-center py-8">
                                <CardContent className="text-center p-0">
                                    <div className="mb-4 text-4xl">📁</div>
                                    <CardTitle className="mb-2">{uni.name}</CardTitle>
                                    <p className="text-muted-foreground text-sm">
                                        {uni._count.pages} articles
                                    </p>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                    {universities.length === 0 && (
                        <p className="text-muted-foreground col-span-full text-center py-10">
                            No universities found.
                        </p>
                    )}
                </div>
            </div>
        )
    }

    // Article Listing Logic (Student or Admin drilling down)

    // Determine effective filter
    let targetUniversityId = userUniversityId;
    let targetUniversityName = userUniversityName;

    if (isAdmin && universityId) {
        targetUniversityId = universityId;
        // Fetch name for display
        const uni = await prisma.university.findUnique({
            where: { id: universityId },
            select: { name: true }
        });
        targetUniversityName = uni?.name || "Unknown University";
    }

    const whereClause = (targetUniversityId)
        ? { universityId: targetUniversityId }
        : {}

    const pages = await prisma.uniPage.findMany({
        where: {
            ...whereClause,
            instituteId: null, // Only show top-level university pages here
            labId: null
        },
        orderBy: { name: 'asc' }
    })

    let institutes: any[] = []
    if (targetUniversityId) {
        institutes = await prisma.institute.findMany({
            where: {
                universityId: targetUniversityId,
                approved: true
            },
            orderBy: { name: 'asc' }
        })
    }

    return (
        <div className="container mx-auto py-10">
            <div className="flex justify-between items-center mb-8">
                <div>
                    {isAdmin && (
                        <Link href="/wiki" className="text-sm text-muted-foreground hover:underline mb-2 block">
                            &larr; Back to Universities
                        </Link>
                    )}
                    <h1 className="text-4xl font-bold">
                        {targetUniversityName
                            ? `${targetUniversityName} Wiki`
                            : 'University Wiki'}
                    </h1>
                    {targetUniversityName && !isAdmin && (
                        <p className="text-muted-foreground mt-2">
                            Exclusive content for {targetUniversityName} students.
                        </p>
                    )}
                </div>
                <AddArticleButton universityId={targetUniversityId} />
            </div>

            <div className="mb-10">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-semibold">Institutes</h2>
                    {targetUniversityId && (
                        <ProposeStructureModal type="institute" parentId={targetUniversityId} />
                    )}
                </div>

                {institutes.length === 0 ? (
                    <Card className="bg-muted/10 border-dashed">
                        <CardContent className="py-8 text-center text-muted-foreground">
                            No institutes found. Propose one to get started!
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {institutes.map((inst) => (
                            <Link key={inst.id} href={`/wiki/institutes/${inst.slug}`}>
                                <Card className="hover:bg-muted/50 transition-colors h-full flex items-center p-6">
                                    <div className="text-3xl mr-4">🏛️</div>
                                    <div>
                                        <CardTitle className="text-lg">{inst.name}</CardTitle>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Institute
                                        </p>
                                    </div>
                                </Card>
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            <h2 className="text-2xl font-semibold mb-4">General Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pages.length === 0 ? (
                    <p className="text-muted-foreground col-span-full text-center py-10">
                        No articles found for this university.
                    </p>
                ) : (
                    pages.map((page) => (
                        <Link key={page.id} href={`/wiki/${page.slug}`}>
                            <Card className="hover:bg-muted/50 transition-colors h-full">
                                <CardHeader>
                                    <CardTitle>{page.name}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground line-clamp-3">
                                        {page.content || "No content yet."}
                                    </p>
                                </CardContent>
                            </Card>
                        </Link>
                    ))
                )}
            </div>
        </div>
    )
}
