import { prisma } from '@/lib/database/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/config"
import { AddArticleButton } from '@/components/features/wiki/AddArticleButton'
import { ProposeStructureModal } from '@/components/features/wiki/ProposeStructureModal'

export const dynamic = 'force-dynamic'

export default async function WikiIndexPage({ searchParams }: { searchParams: Promise<{ universityId?: string, page?: string, institutesPage?: string }> }) {
    const session = await getServerSession(authOptions)
    const userRole = session?.user?.role
    const params = await searchParams
    const { universityId } = params
    const page = parseInt(params.page || '1', 10)
    const institutesPage = parseInt(params.institutesPage || '1', 10)
    const pagesLimit = 50
    const institutesLimit = 20

    // Need to fetch user to get universityId, as it might not be in session depending on config.
    // Assuming we need to fetch user details if not in session. 
    // Usually session doesn't have custom fields unless configured.
    // Let's assume we fetch user to be safe or update session callback?
    // For now, let's fetch user from DB to be sure.
    let userUniversityId: string | null = null;
    let userUniversityName: string | null = null;
    let userSecondaryUniversityId: string | null = null;
    let userSecondaryUniversityName: string | null = null;

    let userId: string | null = null;
    let isAdmin = userRole === 'ADMIN' || userRole === 'STAFF';

    if (session?.user?.email) {
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: {
                university: true,
                secondaryUniversity: true
            }
        })
        if (user) {
            userId = user.id
            userUniversityId = user.universityId
            userUniversityName = user.university?.name ?? null
            userSecondaryUniversityId = user.secondaryUniversityId
            userSecondaryUniversityName = user.secondaryUniversity?.name ?? null
            isAdmin = user.role === 'ADMIN' || user.role === 'STAFF'
        }
    }

    const instituteFilter = (isAdmin || !userId)
        ? (isAdmin ? {} : { approved: true })
        : { OR: [{ approved: true }, { authorId: userId }] }

    const pageFilter = (isAdmin || !userId)
        ? (isAdmin ? {} : { published: true })
        : { OR: [{ published: true }, { revisions: { some: { authorId: userId } } }] }

    // Admin Folder View Logic
    const showUniversityFolders = isAdmin && !universityId;

    if (showUniversityFolders) {
        // Fetch all universities with page counts
        const universities = await prisma.university.findMany({
            include: {
                _count: {
                    select: { pages: true }
                }
            },
            orderBy: {
                pages: { _count: 'desc' }
            }
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
                                    <div className="mb-4">
                                        {uni.logo ? (
                                            <Image
                                                src={uni.logo}
                                                alt={`${uni.name} logo`}
                                                width={64}
                                                height={64}
                                                className="rounded-lg object-contain mx-auto"
                                                unoptimized
                                            />
                                        ) : (
                                            <span className="text-4xl">📁</span>
                                        )}
                                    </div>
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

    // If not admin/staff and no university ID, show nothing
    if (!isAdmin && !targetUniversityId) {
        return (
            <div className="container mx-auto py-10">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-4xl font-bold">University Wiki</h1>
                        <p className="text-muted-foreground mt-2">
                            Please contact your administrator to be assigned to a university.
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    // Students with 2 universities: show folder view like admins
    const hasSecondaryUniversity = !isAdmin && userSecondaryUniversityId && !universityId;

    if (hasSecondaryUniversity) {
        // Fetch both universities with page counts for folder view
        const userUniversities = await prisma.university.findMany({
            where: {
                id: { in: [userUniversityId!, userSecondaryUniversityId!] }
            },
            include: {
                _count: {
                    select: { pages: true, institutes: true }
                }
            },
            orderBy: { name: 'asc' }
        });

        return (
            <div className="container mx-auto py-10">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-4xl font-bold">My Universities Wiki</h1>
                        <p className="text-muted-foreground mt-2">
                            Select a university to view its content.
                        </p>
                    </div>
                    <AddArticleButton />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {userUniversities.map((uni) => (
                        <Link key={uni.id} href={`/wiki?universityId=${uni.id}`}>
                            <Card className="hover:bg-muted/50 transition-colors h-full flex flex-col items-center justify-center py-12 border-2 hover:border-primary/50">
                                <CardContent className="text-center p-0">
                                    <div className="mb-4">
                                        {uni.logo ? (
                                            <Image
                                                src={uni.logo}
                                                alt={`${uni.name} logo`}
                                                width={80}
                                                height={80}
                                                className="rounded-lg object-contain mx-auto"
                                                unoptimized
                                            />
                                        ) : (
                                            <span className="text-5xl">📁</span>
                                        )}
                                    </div>
                                    <CardTitle className="mb-3 text-xl">{uni.name}</CardTitle>
                                    <div className="flex gap-4 justify-center text-muted-foreground text-sm">
                                        <span>{uni._count.pages} articles</span>
                                        <span>•</span>
                                        <span>{uni._count.institutes} institutes</span>
                                    </div>
                                    {uni.id === userUniversityId && (
                                        <Badge variant="outline" className="mt-3">Primary</Badge>
                                    )}
                                    {uni.id === userSecondaryUniversityId && (
                                        <Badge variant="secondary" className="mt-3">Secondary</Badge>
                                    )}
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>
        )
    }

    // Single university view (or admin drilling down into specific university)
    const universityIds = [targetUniversityId].filter(Boolean) as string[]

    const whereClause = { universityId: targetUniversityId! }

    const pagesSkip = (page - 1) * pagesLimit
    const institutesSkip = (institutesPage - 1) * institutesLimit

    const [pages, pagesCount, institutes, institutesCount] = await Promise.all([
        prisma.uniPage.findMany({
            where: {
                ...whereClause,
                instituteId: null,
                labId: null,
                ...pageFilter
            },
            include: {
                university: { select: { name: true } }
            },
            orderBy: { name: 'asc' },
            take: pagesLimit,
            skip: pagesSkip
        }),
        prisma.uniPage.count({
            where: {
                ...whereClause,
                instituteId: null,
                labId: null,
                ...pageFilter
            }
        }),
        prisma.institute.findMany({
            where: {
                universityId: universityIds[0],
                ...instituteFilter
            },
            include: {
                university: { select: { name: true } }
            },
            orderBy: { name: 'asc' },
            take: institutesLimit,
            skip: institutesSkip
        }),
        prisma.institute.count({
            where: {
                universityId: universityIds[0],
                ...instituteFilter
            }
        })
    ])

    const totalPagesCount = Math.ceil(pagesCount / pagesLimit)
    const totalInstitutesCount = Math.ceil(institutesCount / institutesLimit)
    const currentPage = Math.max(1, Math.min(page, totalPagesCount || 1))
    const currentInstitutesPage = Math.max(1, Math.min(institutesPage, totalInstitutesCount || 1))

    // Check if student is viewing from folder selection (has universityId param but not admin)
    const isStudentDrillDown = !isAdmin && universityId;

    return (
        <div className="container mx-auto py-10">
            <div className="flex justify-between items-center mb-8">
                <div>
                    {isAdmin && (
                        <Link href="/wiki" className="text-sm text-muted-foreground hover:underline mb-2 block">
                            &larr; Back to Universities
                        </Link>
                    )}
                    {isStudentDrillDown && userSecondaryUniversityId && (
                        <Link href="/wiki" className="text-sm text-muted-foreground hover:underline mb-2 block">
                            &larr; Back to My Universities
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
                <div className="flex gap-2">
                    {isAdmin && targetUniversityId && (
                        <Link href={`/wiki/university/${targetUniversityId}/history`}>
                            <Button variant="outline">Recent Activity</Button>
                        </Link>
                    )}
                    <AddArticleButton universityId={targetUniversityId} />
                </div>
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
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {institutes.map((inst) => (
                                <Link key={inst.id} href={`/wiki/institutes/${inst.slug}`}>
                                    <Card className="hover:bg-muted/50 transition-colors h-full flex items-center p-6">
                                        <div className="text-3xl mr-4">🏛️</div>
                                        <div className="flex-1">
                                            <CardTitle className="text-lg">{inst.name}</CardTitle>
                                            <span className="text-xs text-muted-foreground">Institute</span>
                                        </div>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                        {totalInstitutesCount > 1 && (
                            <div className="flex items-center justify-between mt-6">
                                <div className="text-sm text-muted-foreground">
                                    Showing {((currentInstitutesPage - 1) * institutesLimit) + 1} to {Math.min(currentInstitutesPage * institutesLimit, institutesCount)} of {institutesCount} institutes
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={currentInstitutesPage === 1}
                                        asChild={currentInstitutesPage > 1}
                                    >
                                        {currentInstitutesPage > 1 ? (
                                            <Link href={`/wiki?universityId=${targetUniversityId}&institutesPage=${currentInstitutesPage - 1}`}>
                                                <ChevronLeft className="h-4 w-4 mr-1" />
                                                Previous
                                            </Link>
                                        ) : (
                                            <>
                                                <ChevronLeft className="h-4 w-4 mr-1" />
                                                Previous
                                            </>
                                        )}
                                    </Button>
                                    <div className="flex items-center gap-1">
                                        {Array.from({ length: Math.min(5, totalInstitutesCount) }, (_, i) => {
                                            let pageNum
                                            if (totalInstitutesCount <= 5) {
                                                pageNum = i + 1
                                            } else if (currentInstitutesPage <= 3) {
                                                pageNum = i + 1
                                            } else if (currentInstitutesPage >= totalInstitutesCount - 2) {
                                                pageNum = totalInstitutesCount - 4 + i
                                            } else {
                                                pageNum = currentInstitutesPage - 2 + i
                                            }
                                            return (
                                                <Button
                                                    key={pageNum}
                                                    variant={currentInstitutesPage === pageNum ? "default" : "outline"}
                                                    size="sm"
                                                    asChild
                                                >
                                                    <Link href={`/wiki?universityId=${targetUniversityId}&institutesPage=${pageNum}`}>{pageNum}</Link>
                                                </Button>
                                            )
                                        })}
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={currentInstitutesPage === totalInstitutesCount}
                                        asChild={currentInstitutesPage < totalInstitutesCount}
                                    >
                                        {currentInstitutesPage < totalInstitutesCount ? (
                                            <Link href={`/wiki?universityId=${targetUniversityId}&institutesPage=${currentInstitutesPage + 1}`}>
                                                Next
                                                <ChevronRight className="h-4 w-4 ml-1" />
                                            </Link>
                                        ) : (
                                            <>
                                                Next
                                                <ChevronRight className="h-4 w-4 ml-1" />
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            <h2 className="text-2xl font-semibold mb-4">General Articles</h2>
            {pages.length === 0 ? (
                <p className="text-muted-foreground col-span-full text-center py-10">
                    No articles found for this university.
                </p>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {pages.map((page) => (
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
                        ))}
                    </div>
                    {totalPagesCount > 1 && (
                        <div className="flex items-center justify-between mt-6">
                            <div className="text-sm text-muted-foreground">
                                Showing {((currentPage - 1) * pagesLimit) + 1} to {Math.min(currentPage * pagesLimit, pagesCount)} of {pagesCount} articles
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={currentPage === 1}
                                    asChild={currentPage > 1}
                                >
                                    {currentPage > 1 ? (
                                        <Link href={`/wiki?universityId=${targetUniversityId}&page=${currentPage - 1}`}>
                                            <ChevronLeft className="h-4 w-4 mr-1" />
                                            Previous
                                        </Link>
                                    ) : (
                                        <>
                                            <ChevronLeft className="h-4 w-4 mr-1" />
                                            Previous
                                        </>
                                    )}
                                </Button>
                                <div className="flex items-center gap-1">
                                    {Array.from({ length: Math.min(5, totalPagesCount) }, (_, i) => {
                                        let pageNum
                                        if (totalPagesCount <= 5) {
                                            pageNum = i + 1
                                        } else if (currentPage <= 3) {
                                            pageNum = i + 1
                                        } else if (currentPage >= totalPagesCount - 2) {
                                            pageNum = totalPagesCount - 4 + i
                                        } else {
                                            pageNum = currentPage - 2 + i
                                        }
                                        return (
                                            <Button
                                                key={pageNum}
                                                variant={currentPage === pageNum ? "default" : "outline"}
                                                size="sm"
                                                asChild
                                            >
                                                <Link href={`/wiki?universityId=${targetUniversityId}&page=${pageNum}`}>{pageNum}</Link>
                                            </Button>
                                        )
                                    })}
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={currentPage === totalPagesCount}
                                    asChild={currentPage < totalPagesCount}
                                >
                                    {currentPage < totalPagesCount ? (
                                        <Link href={`/wiki?universityId=${targetUniversityId}&page=${currentPage + 1}`}>
                                            Next
                                            <ChevronRight className="h-4 w-4 ml-1" />
                                        </Link>
                                    ) : (
                                        <>
                                            Next
                                            <ChevronRight className="h-4 w-4 ml-1" />
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}
