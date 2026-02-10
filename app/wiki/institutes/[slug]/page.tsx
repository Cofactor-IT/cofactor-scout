import { prisma } from '@/lib/prisma'
import { ensureAbsoluteUrl } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-config"
import { notFound } from 'next/navigation'
import { ProposeStructureModal } from '../../ProposeStructureModal'
import { AddPersonModal } from '../../AddPersonModal'
import { EditPersonModal, DeletePersonButton } from '../../EditPersonModal'
import { AddArticleButton } from '../../AddArticleButton'

export const dynamic = 'force-dynamic'

export default async function InstitutePage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    const session = await getServerSession(authOptions)

    let userId: string | null = null;
    let isAdmin = false;
    let userUniversityId: string | null = null;

    if (session?.user?.email) {
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true, role: true, universityId: true }
        })
        if (user) {
            userId = user.id
            isAdmin = user.role === 'ADMIN' || user.role === 'STAFF'
            userUniversityId = user.universityId
        }
    }

    let itemFilter: any = { approved: true };
    let pageFilter: any = { published: true };

    if (isAdmin) {
        itemFilter = {};
        pageFilter = {};
    } else if (userId) {
        itemFilter = { OR: [{ approved: true }, { authorId: userId }] };
        pageFilter = { OR: [{ published: true }, { revisions: { some: { authorId: userId } } }] };
    }

    const institute = await prisma.institute.findUnique({
        where: { slug },
        include: {
            labs: {
                where: itemFilter,
                orderBy: { name: 'asc' }
            },
            people: {
                where: itemFilter,
                orderBy: { name: 'asc' }
            },
            pages: {
                where: pageFilter,
                orderBy: { name: 'asc' }
            }
        }
    })

    const canEdit = isAdmin || (userUniversityId && institute && userUniversityId === institute.universityId)

    if (!institute) {
        notFound()
    }

    // Check if user can edit (admin/staff or belongs to the same university)
    // Logic moved up to support filtering

    return (
        <div className="container mx-auto py-10">
            {/* Header */}
            <div className="mb-8">
                <Link href={`/wiki?universityId=${institute.universityId}`} className="text-sm text-muted-foreground hover:underline mb-2 block">
                    &larr; Back to University
                </Link>
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-4xl font-bold">{institute.name}</h1>
                        <p className="text-muted-foreground mt-2">Institute</p>
                    </div>
                    {canEdit && (
                        <Link href={`/wiki/institutes/${slug}/history`}>
                            <Button variant="outline">Recent Activity</Button>
                        </Link>
                    )}
                </div>
            </div>

            {/* Labs Section */}
            <div className="mb-12">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-semibold">Labs</h2>
                    <ProposeStructureModal type="lab" parentId={institute.id} />
                </div>
                {institute.labs.length === 0 ? (
                    <Card className="bg-muted/10 border-dashed">
                        <CardContent className="py-8 text-center text-muted-foreground">
                            No labs found. Propose one to get started!
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {institute.labs.map((lab) => (
                            <Link key={lab.id} href={`/wiki/labs/${lab.slug}`}>
                                <Card className="hover:bg-muted/50 transition-colors h-full flex items-center p-6">
                                    <div className="text-3xl mr-4">🧪</div>
                                    <div>
                                        <CardTitle className="text-lg">{lab.name}</CardTitle>
                                        <p className="text-xs text-muted-foreground mt-1">Lab</p>
                                    </div>
                                </Card>
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            {/* People Section */}
            <div className="mb-12">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-semibold">People / Directory</h2>
                    <AddPersonModal contextId={institute.id} contextType="institute" />
                </div>
                {institute.people.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4 bg-muted/10 rounded-lg">
                        No members listed yet.
                    </p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {institute.people.map((person) => (
                            <Card key={person.id} className="h-full">
                                <CardContent className="pt-6">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <Link href={`/wiki/people/${person.slug}`} className="hover:underline">
                                                <h3 className="font-semibold text-lg">{person.name}</h3>
                                            </Link>
                                            <p className="text-sm text-muted-foreground">{person.role}</p>
                                            {person.fieldOfStudy && (
                                                <p className="text-xs text-muted-foreground mt-1">{person.fieldOfStudy}</p>
                                            )}
                                        </div>
                                        {canEdit && (
                                            <div className="flex gap-1">
                                                <EditPersonModal
                                                    person={person}
                                                    contextId={institute.id}
                                                    contextType="institute"
                                                />
                                                <DeletePersonButton
                                                    personId={person.id}
                                                    personName={person.name}
                                                />
                                            </div>
                                        )}
                                    </div>
                                    {person.bio && (
                                        <p className="text-sm mt-3 line-clamp-3">{person.bio}</p>
                                    )}
                                    <div className="mt-4 flex gap-2">
                                        {person.linkedin && <a href={ensureAbsoluteUrl(person.linkedin)} target="_blank" rel="noreferrer" className="text-xs bg-muted px-2 py-1 rounded hover:bg-muted/80">LinkedIn</a>}
                                        {person.twitter && <a href={ensureAbsoluteUrl(person.twitter)} target="_blank" rel="noreferrer" className="text-xs bg-muted px-2 py-1 rounded hover:bg-muted/80">Twitter</a>}
                                        {person.website && <a href={ensureAbsoluteUrl(person.website)} target="_blank" rel="noreferrer" className="text-xs bg-muted px-2 py-1 rounded hover:bg-muted/80">Website</a>}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* Articles Section */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-semibold">Articles</h2>
                    <AddArticleButton instituteId={institute.id} universityId={institute.universityId} />
                </div>
                {institute.pages.length === 0 ? (
                    <p className="text-muted-foreground col-span-full text-center py-10">
                        No articles found.
                    </p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Similar to Wiki list */}
                        {institute.pages.map((page) => (
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
                )}
            </div>
        </div>
    )
}
