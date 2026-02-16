'use client'

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import Link from 'next/link'
import { WikiRevision } from '@prisma/client'
import { Button } from '@/components/ui/button'
import { rollbackToRevision } from '@/actions/wiki-history.actions'

type ActivityTimelineProps = {
    grouped: {
        date: string
        revisions: (WikiRevision & {
            uniPage: { name: string, slug: string },
            author: { name: string | null },
            title?: string | null
        })[]
    }[],
    isAdmin?: boolean
}

export function ActivityTimeline({ grouped, isAdmin }: ActivityTimelineProps) {
    if (!grouped || grouped.length === 0) {
        return (
            <Card className="border-dashed">
                <CardContent className="py-8 text-center text-muted-foreground">
                    No recent activity found.
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-8">
            {grouped.map((group) => (
                <div key={group.date}>
                    <h3 className="text-lg font-semibold mb-4 px-2 border-l-4 border-primary/20 sticky top-0 bg-background py-2">
                        {group.date}
                    </h3>
                    <div className="space-y-4 ml-2 pl-4 border-l-2 border-border/50">
                        {group.revisions.map((rev) => (
                            <Card key={rev.id} className="hover:bg-muted/50 transition-colors border-l-4 border-l-transparent hover:border-l-primary mb-3">
                                <div className="p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Link
                                                href={`/wiki/${rev.uniPage.slug}`}
                                                className="font-medium text-foreground hover:text-primary transition-colors hover:underline"
                                            >
                                                {rev.title || rev.uniPage.name}
                                            </Link>
                                            <Badge variant={
                                                rev.status === 'APPROVED' ? 'default' :
                                                    rev.status === 'PENDING' ? 'secondary' :
                                                        'destructive'
                                            }>
                                                {rev.status}
                                            </Badge>
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            Updated by <span className="font-medium text-foreground">{rev.author.name || 'Unknown'}</span>
                                            <span className="mx-2">•</span>
                                            {new Date(rev.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Link href={`/wiki/diff/${rev.id}`}>
                                            <Button variant="ghost" size="sm">Diff</Button>
                                        </Link>

                                        {isAdmin && rev.status !== 'PENDING' && (
                                            <form action={async () => {
                                                await rollbackToRevision(rev.id)
                                            }}>
                                                <Button type="submit" variant="outline" size="sm">
                                                    Revert
                                                </Button>
                                            </form>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    )
}
