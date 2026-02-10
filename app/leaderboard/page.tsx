import { prisma } from '@/lib/prisma'
import { unstable_cache } from 'next/cache'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

export const dynamic = 'force-dynamic'

export default async function LeaderboardPage() {
    const getCachedLeaderboard = unstable_cache(
        async () => {
            return prisma.user.findMany({
                where: { role: 'STUDENT' }, // Only rank students
                orderBy: { powerScore: 'desc' },
                take: 50
            })
        },
        ['leaderboard-data'],
        {
            tags: ['leaderboard'],
            revalidate: 900 // 15 minutes
        }
    )

    const users = await getCachedLeaderboard()

    return (
        <div className="container mx-auto py-10">
            <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-primary to-primary/50 bg-clip-text text-transparent">Global Leaderboard</h1>

            <Card className="max-w-4xl mx-auto border-zinc-800 bg-zinc-950/50 backdrop-blur">
                <CardHeader>
                    <CardTitle>Top Students</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[100px]">Rank</TableHead>
                                <TableHead>Student</TableHead>
                                <TableHead className="text-right">Power Score</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center py-10">No students yet.</TableCell>
                                </TableRow>
                            ) : (
                                users.map((user, index) => (
                                    <TableRow key={user.id}>
                                        <TableCell className="font-medium">
                                            {index === 0 && <span className="text-2xl">🥇</span>}
                                            {index === 1 && <span className="text-2xl">🥈</span>}
                                            {index === 2 && <span className="text-2xl">🥉</span>}
                                            {index > 2 && <Badge variant="outline">#{index + 1}</Badge>}
                                        </TableCell>
                                        <TableCell>{user.name || user.email}</TableCell>
                                        <TableCell className="text-right font-bold text-lg">{user.powerScore}</TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
