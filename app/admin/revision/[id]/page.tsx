import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { approveRevision, rejectRevision } from '../../actions'
import { notFound } from 'next/navigation'
import { DiffViewer } from '@/components/DiffViewer'
import Link from 'next/link'

export default async function RevisionPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const revision = await prisma.wikiRevision.findUnique({
        where: { id },
        include: { uniPage: true, author: true }
    })

    if (!revision) notFound()

    const isAlreadyProcessed = revision.status !== 'PENDING'

    return (
        <div className="container mx-auto py-10">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                    <h1 className="text-3xl font-bold">Review Edit: {revision.uniPage.name}</h1>
                    <Badge variant={
                        revision.status === 'APPROVED' ? 'default' :
                            revision.status === 'REJECTED' ? 'destructive' : 'secondary'
                    }>
                        {revision.status}
                    </Badge>
                </div>
                {!isAlreadyProcessed && (
                    <div className="flex gap-2">
                        <form action={approveRevision.bind(null, revision.id)}>
                            <Button className="bg-green-600 hover:bg-green-700">Approve</Button>
                        </form>
                        <form action={rejectRevision.bind(null, revision.id)}>
                            <Button variant="destructive">Reject</Button>
                        </form>
                    </div>
                )}
            </div>

            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="text-lg">Submission Details</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <span className="text-muted-foreground">Author:</span>
                        <span className="ml-2 font-medium">{revision.author.name || revision.author.email}</span>
                    </div>
                    <div>
                        <span className="text-muted-foreground">Submitted:</span>
                        <span className="ml-2 font-medium">{new Date(revision.createdAt).toLocaleString()}</span>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Changes</CardTitle>
                </CardHeader>
                <CardContent>
                    <DiffViewer
                        oldContent={revision.uniPage.content}
                        newContent={revision.content}
                    />
                </CardContent>
            </Card>

            <div className="mt-6 flex justify-center">
                <Link href="/admin/dashboard">
                    <Button variant="outline">Back to Dashboard</Button>
                </Link>
            </div>
        </div>
    )
}
