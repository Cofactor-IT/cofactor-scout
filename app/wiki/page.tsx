import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-config"
import { AddArticleButton } from './AddArticleButton'

export const dynamic = 'force-dynamic'

export default async function WikiIndexPage() {
    const session = await getServerSession(authOptions)
    const userRole = session?.user?.role
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

    const whereClause = (userRole === 'STUDENT' && userUniversityId)
        ? { universityId: userUniversityId }
        : {}

    const pages = await prisma.uniPage.findMany({
        where: whereClause,
        orderBy: { name: 'asc' }
    })

    return (
        <div className="container mx-auto py-10">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-4xl font-bold">
                        {userRole === 'STUDENT' && userUniversityName
                            ? `${userUniversityName} Wiki`
                            : 'University Wiki'}
                    </h1>
                    {userRole === 'STUDENT' && userUniversityName && (
                        <p className="text-muted-foreground mt-2">
                            Exclusive content for {userUniversityName} students.
                        </p>
                    )}
                </div>
                <AddArticleButton />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pages.length === 0 ? (
                    <p className="text-muted-foreground col-span-full text-center py-10">
                        No universities found. Be the first to add one!
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
