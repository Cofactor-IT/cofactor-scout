import { prisma } from '@/lib/database/prisma'
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/config"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TextDiffViewer } from '@/components/wiki/TextDiffViewer'
import Link from 'next/link'

export default async function DiffPage({ params }: { params: Promise<{ revisionId: string }> }) {
    const { revisionId } = await params
    const session = await getServerSession(authOptions)

    // Check Auth
    const isAdmin = session?.user?.role === 'ADMIN' || session?.user?.role === 'STAFF'
    if (!isAdmin) {
        return <div className="p-10 text-destructive text-center">Access Denied</div>
    }

    const currentRev = await prisma.wikiRevision.findUnique({
        where: { id: revisionId },
        include: {
            uniPage: true,
            author: true
        }
    })

    if (!currentRev) {
        return <div className="container mx-auto py-10 text-center">Revision not found</div>
    }

    // Find Previous Revision (for same page, created BEFORE this one)
    const prevRev = await prisma.wikiRevision.findFirst({
        where: {
            uniPageId: currentRev.uniPageId,
            createdAt: { lt: currentRev.createdAt }
        },
        orderBy: { createdAt: 'desc' }
    })

    const oldContent = prevRev ? prevRev.content : ''
    const newContent = currentRev.content

    return (
        <div className="container mx-auto py-10 max-w-5xl">
            <div className="mb-6 flex justify-between items-center">
                <div>
                    <Link href={`/wiki/${currentRev.uniPage.slug}/history`} className="text-sm text-muted-foreground hover:underline mb-2 block">
                        &larr; Back to History
                    </Link>
                    <h1 className="text-3xl font-bold">
                        Diff: {new Date(currentRev.createdAt).toLocaleString()}
                    </h1>
                    <p className="text-muted-foreground">
                        Author: {currentRev.author.name}
                    </p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Content Changes</CardTitle>
                </CardHeader>
                <CardContent className="p-0 overflow-hidden">
                    <div className="p-4 bg-muted/30 border-b flex justify-between text-xs font-mono">
                        <span className="text-red-600">- Previous Version ({prevRev ? new Date(prevRev.createdAt).toLocaleTimeString() : 'Initial'})</span>
                        <span className="text-green-600">+ This Version ({new Date(currentRev.createdAt).toLocaleTimeString()})</span>
                    </div>
                    {/* Client Component for Diff Rendering */}
                    <TextDiffViewer oldValue={oldContent} newValue={newContent} />
                </CardContent>
            </Card>
        </div>
    )
}
