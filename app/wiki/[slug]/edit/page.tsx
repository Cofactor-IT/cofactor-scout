import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { proposeEdit } from '../../actions'
import { WikiEditorWrapper } from './WikiEditorWrapper'

export default async function EditWikiPage({ params, searchParams }: { params: Promise<{ slug: string }>, searchParams: Promise<{ title?: string, universityId?: string, instituteId?: string, labId?: string }> }) {
    const { slug } = await params
    const { title, universityId, instituteId, labId } = await searchParams
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
                        {instituteId && <input type="hidden" name="instituteId" value={instituteId} />}
                        {labId && <input type="hidden" name="labId" value={labId} />}

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
                            {/* We use a hidden input to submit the data, controlled by client wrapper */}
                            <WikiEditorWrapper defaultValue={uniPage?.content || ''} />
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
