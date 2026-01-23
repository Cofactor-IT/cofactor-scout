import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { proposeEdit } from '../../actions'

export default async function EditWikiPage({ params, searchParams }: { params: Promise<{ slug: string }>, searchParams: Promise<{ title?: string, universityId?: string }> }) {
    const { slug } = await params
    const { title, universityId } = await searchParams
    const uniPage = await prisma.uniPage.findUnique({
        where: { slug }
    })

    return (
        <div className="container mx-auto py-10 max-w-3xl">
            <Card>
                <CardHeader>
                    <CardTitle>Propose Edit for {uniPage ? uniPage.name : (title || slug)}</CardTitle>
                </CardHeader>
                <CardContent>
                    <form action={proposeEdit} className="space-y-6">
                        <input type="hidden" name="slug" value={slug} />
                        {universityId && <input type="hidden" name="universityId" value={universityId} />}

                        {!uniPage && (
                            <div className="space-y-2">
                                <Label htmlFor="uniName">Page Title</Label>
                                <Input
                                    id="uniName"
                                    name="uniName"
                                    placeholder="e.g. Introduction to Biochemistry"
                                    defaultValue={title || ''}
                                    required
                                />
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="content">Content (Markdown supported)</Label>
                            <Textarea
                                id="content"
                                name="content"
                                className="min-h-[400px] font-mono"
                                defaultValue={uniPage?.content || ''}
                                required
                            />
                        </div>

                        <div className="flex justify-end gap-4">
                            <Button type="submit">Submit Proposal</Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
