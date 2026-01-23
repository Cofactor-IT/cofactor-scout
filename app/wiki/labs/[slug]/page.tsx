import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-config"
import { notFound } from 'next/navigation'
import { AddPersonModal } from '../../AddPersonModal'
import { AddArticleButton } from '../../AddArticleButton'

export const dynamic = 'force-dynamic'

export default async function LabPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    const session = await getServerSession(authOptions)

    const lab = await prisma.lab.findUnique({
        where: { slug },
        include: {
            institute: true,
            people: {
                orderBy: { name: 'asc' }
            },
            pages: {
                orderBy: { name: 'asc' }
            }
        }
    })

    if (!lab) {
        notFound()
    }

    return (
        <div className="container mx-auto py-10">
            {/* Header */}
            <div className="mb-8">
                <Link href={`/wiki/institutes/${lab.institute.slug}`} className="text-sm text-muted-foreground hover:underline mb-2 block">
                    &larr; Back to {lab.institute.name}
                </Link>
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-4xl font-bold">{lab.name}</h1>
                        <p className="text-muted-foreground mt-2">Lab</p>
                    </div>
                </div>
            </div>

            {/* People Section */}
            <div className="mb-12">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-semibold">People / Team</h2>
                    <AddPersonModal contextId={lab.id} contextType="lab" />
                </div>
                {lab.people.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4 bg-muted/10 rounded-lg">
                        No members listed yet.
                    </p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {lab.people.map((person) => (
                            <Card key={person.id} className="h-full">
                                <CardContent className="pt-6">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="font-semibold text-lg">{person.name}</h3>
                                            <p className="text-sm text-muted-foreground">{person.role}</p>
                                            {person.fieldOfStudy && (
                                                <p className="text-xs text-muted-foreground mt-1">{person.fieldOfStudy}</p>
                                            )}
                                        </div>
                                    </div>
                                    {person.bio && (
                                        <p className="text-sm mt-3 line-clamp-3">{person.bio}</p>
                                    )}
                                    <div className="mt-4 flex gap-2">
                                        {person.linkedin && <a href={person.linkedin} target="_blank" rel="noreferrer" className="text-xs bg-muted px-2 py-1 rounded hover:bg-muted/80">LinkedIn</a>}
                                        {person.twitter && <a href={person.twitter} target="_blank" rel="noreferrer" className="text-xs bg-muted px-2 py-1 rounded hover:bg-muted/80">Twitter</a>}
                                        {person.website && <a href={person.website} target="_blank" rel="noreferrer" className="text-xs bg-muted px-2 py-1 rounded hover:bg-muted/80">Website</a>}
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
                    <h2 className="text-2xl font-semibold">publications / Articles</h2>
                    <AddArticleButton labId={lab.id} instituteId={lab.institute.id} universityId={lab.institute.universityId} />
                </div>
                {lab.pages.length === 0 ? (
                    <p className="text-muted-foreground col-span-full text-center py-10">
                        No articles found.
                    </p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {lab.pages.map((page) => (
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
