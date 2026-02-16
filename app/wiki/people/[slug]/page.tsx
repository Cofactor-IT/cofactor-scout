import { prisma } from '@/lib/database/prisma'
import { ensureAbsoluteUrl } from '@/lib/utils/formatting'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ExternalLink, Building2, FlaskConical, FileText } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function PersonPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params


    const person = await prisma.person.findUnique({
        where: { slug },
        include: {
            institute: {
                include: {
                    university: true
                }
            },
            lab: {
                include: {
                    institute: {
                        include: {
                            university: true
                        }
                    }
                }
            }
        }
    })

    if (!person) {
        notFound()
    }

    // Get the university from either institute or lab
    const university = person.institute?.university || person.lab?.institute?.university

    // Find articles that mention this person
    // The mention format is: [@PersonName](/wiki/people/{slug})
    const mentionPattern = `/wiki/people/${person.slug}`

    const mentioningArticles = await prisma.uniPage.findMany({
        where: {
            content: {
                contains: mentionPattern
            }
        },
        select: {
            id: true,
            name: true,
            slug: true
        },
        orderBy: { name: 'asc' }
    })

    return (
        <div className="container mx-auto py-10 max-w-4xl">
            {/* Breadcrumb */}
            <div className="mb-6 text-sm text-muted-foreground">
                <Link href="/wiki" className="hover:underline">Wiki</Link>
                {person.institute && (
                    <>
                        <span className="mx-2">→</span>
                        <Link href={`/wiki/institutes/${person.institute.slug}`} className="hover:underline">
                            {person.institute.name}
                        </Link>
                    </>
                )}
                {person.lab && (
                    <>
                        <span className="mx-2">→</span>
                        <Link href={`/wiki/institutes/${person.lab.institute.slug}`} className="hover:underline">
                            {person.lab.institute.name}
                        </Link>
                        <span className="mx-2">→</span>
                        <Link href={`/wiki/labs/${person.lab.slug}`} className="hover:underline">
                            {person.lab.name}
                        </Link>
                    </>
                )}
            </div>

            {/* Person Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold mb-2">{person.name}</h1>
                {person.role && (
                    <p className="text-xl text-muted-foreground">{person.role}</p>
                )}
                {person.fieldOfStudy && (
                    <p className="text-lg text-muted-foreground mt-1">{person.fieldOfStudy}</p>
                )}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Bio and Details */}
                <div className="lg:col-span-2 space-y-6">
                    {person.bio && (
                        <Card>
                            <CardHeader>
                                <CardTitle>About</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="whitespace-pre-wrap">{person.bio}</p>
                            </CardContent>
                        </Card>
                    )}

                    {/* Mentioned In Section */}
                    {mentioningArticles.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="h-5 w-5" />
                                    Mentioned In
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {mentioningArticles.map((article) => (
                                        <Link
                                            key={article.id}
                                            href={`/wiki/${article.slug}`}
                                            className="flex items-center gap-2 p-2 rounded-md hover:bg-muted transition-colors"
                                        >
                                            <FileText className="h-4 w-4 text-muted-foreground" />
                                            <span>{article.name}</span>
                                        </Link>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Right Column - Affiliation and Links */}
                <div className="space-y-6">
                    {/* Affiliation Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Affiliation</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {university && (
                                <div className="flex items-center gap-2 text-sm">
                                    <Building2 className="h-4 w-4 text-muted-foreground" />
                                    <span>{university.name}</span>
                                </div>
                            )}
                            {person.institute && (
                                <Link
                                    href={`/wiki/institutes/${person.institute.slug}`}
                                    className="flex items-center gap-2 text-sm hover:underline"
                                >
                                    <Building2 className="h-4 w-4 text-muted-foreground" />
                                    <span>{person.institute.name}</span>
                                </Link>
                            )}
                            {person.lab && (
                                <Link
                                    href={`/wiki/labs/${person.lab.slug}`}
                                    className="flex items-center gap-2 text-sm hover:underline"
                                >
                                    <FlaskConical className="h-4 w-4 text-muted-foreground" />
                                    <span>{person.lab.name}</span>
                                </Link>
                            )}
                        </CardContent>
                    </Card>

                    {/* Social Links Card */}
                    {(person.linkedin || person.twitter || person.website) && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Links</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {person.linkedin && (
                                    <a
                                        href={ensureAbsoluteUrl(person.linkedin)}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex items-center gap-2 text-sm p-2 rounded-md hover:bg-muted transition-colors"
                                    >
                                        <ExternalLink className="h-4 w-4" />
                                        LinkedIn
                                    </a>
                                )}
                                {person.twitter && (
                                    <a
                                        href={ensureAbsoluteUrl(person.twitter)}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex items-center gap-2 text-sm p-2 rounded-md hover:bg-muted transition-colors"
                                    >
                                        <ExternalLink className="h-4 w-4" />
                                        Twitter/X
                                    </a>
                                )}
                                {person.website && (
                                    <a
                                        href={ensureAbsoluteUrl(person.website)}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex items-center gap-2 text-sm p-2 rounded-md hover:bg-muted transition-colors"
                                    >
                                        <ExternalLink className="h-4 w-4" />
                                        Website
                                    </a>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    )
}
