import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import Link from 'next/link'
import { approveRevision, rejectRevision, approveStaff, rejectStaff } from '../actions'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
    // Parallel data fetching for all metrics
    const [
        pendingRevisions,
        pendingStaff,
        totalUsers,
        totalReferrals,
        totalEdits,
        topPerformers,
        recentSignups
    ] = await Promise.all([
        // 1. Pending Revisions
        prisma.wikiRevision.findMany({
            where: { status: 'PENDING' },
            include: { uniPage: true, author: true },
            orderBy: { createdAt: 'desc' }
        }),
        // 2. Pending Staff
        prisma.user.findMany({
            where: { role: 'PENDING_STAFF' },
            orderBy: { createdAt: 'desc' }
        }),
        // 3. Total Users
        prisma.user.count(),
        // 4. Total Referrals
        prisma.referral.count(),
        // 5. Total Approved Edits
        prisma.wikiRevision.count({ where: { status: 'APPROVED' } }),
        // 6. Top Performers (Top 10 by PowerScore)
        prisma.user.findMany({
            orderBy: { powerScore: 'desc' },
            take: 10,
            include: {
                _count: {
                    select: {
                        referralsMade: true,
                        revisions: { where: { status: 'APPROVED' } }
                    }
                }
            }
        }),
        // 7. Recent Signups (Last 5)
        prisma.user.findMany({
            orderBy: { createdAt: 'desc' },
            take: 5
        })
    ])

    return (
        <div className="container mx-auto py-10 space-y-8">
            <h1 className="text-4xl font-bold">Admin Dashboard</h1>

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4 text-muted-foreground"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalUsers}</div>
                        <p className="text-xs text-muted-foreground">Members in network</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Referrals</CardTitle>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4 text-muted-foreground"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalReferrals}</div>
                        <p className="text-xs text-muted-foreground">Successful invites</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Wiki Contributions</CardTitle>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4 text-muted-foreground"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /></svg>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalEdits}</div>
                        <p className="text-xs text-muted-foreground">Approved revisions</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Actions</CardTitle>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4 text-muted-foreground"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{pendingRevisions.length + pendingStaff.length}</div>
                        <p className="text-xs text-muted-foreground">Requires attention</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/* Top Performers Table */}
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Top Performers</CardTitle>
                        <CardDescription>Highest scoring users by Power Score.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[100px]">Rank</TableHead>
                                    <TableHead>User</TableHead>
                                    <TableHead>Score</TableHead>
                                    <TableHead>Referrals</TableHead>
                                    <TableHead className="text-right">Edits</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {topPerformers.map((user, i) => (
                                    <TableRow key={user.id}>
                                        <TableCell className="font-medium">#{i + 1}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span>{user.name || 'Anonymous'}</span>
                                                <span className="text-xs text-muted-foreground">{user.email}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>{user.powerScore}</TableCell>
                                        <TableCell>{user._count.referralsMade}</TableCell>
                                        <TableCell className="text-right">{user._count.revisions}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Recent Signups */}
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Recent Signups</CardTitle>
                        <CardDescription>Newest members of the network.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-8">
                            {recentSignups.map((user) => (
                                <div key={user.id} className="flex items-center">
                                    <div className="ml-4 space-y-1">
                                        <p className="text-sm font-medium leading-none">{user.name}</p>
                                        <p className="text-sm text-muted-foreground mb-1">{user.email}</p>
                                        <Badge variant={user.role === 'ADMIN' ? 'destructive' : user.role === 'STAFF' ? 'default' : 'secondary'} className="text-[10px] h-5">
                                            {user.role}
                                        </Badge>
                                    </div>
                                    <div className="ml-auto font-medium text-xs text-muted-foreground">
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Staff Applications */}
            {pendingStaff.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Staff Applications ({pendingStaff.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {pendingStaff.map((user) => (
                                <div key={user.id} className="flex justify-between items-center border p-4 rounded-lg">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-bold text-lg">{user.name || 'Unnamed User'}</h3>
                                            <Badge variant="secondary">Pending Staff</Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            {user.email} • Joined {new Date(user.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <form action={approveStaff.bind(null, user.id)}>
                                            <Button size="sm" className="bg-green-600 hover:bg-green-700">Approve</Button>
                                        </form>
                                        <form action={rejectStaff.bind(null, user.id)}>
                                            <Button size="sm" variant="destructive">Reject</Button>
                                        </form>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Wiki Revisions */}
            <Card>
                <CardHeader>
                    <CardTitle>Pending Revisions ({pendingRevisions.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    {pendingRevisions.length === 0 ? (
                        <p className="text-muted-foreground">No pending revisions.</p>
                    ) : (
                        <div className="space-y-4">
                            {pendingRevisions.map((rev) => (
                                <div key={rev.id} className="flex justify-between items-start border p-4 rounded-lg">
                                    <div>
                                        <h3 className="font-bold text-lg">{rev.uniPage.name}</h3>
                                        <p className="text-sm text-muted-foreground">
                                            By {rev.author.email} • {new Date(rev.createdAt).toLocaleDateString()}
                                        </p>
                                        <div className="mt-2 p-2 bg-muted rounded text-sm max-h-20 overflow-hidden text-ellipsis">
                                            {rev.content.substring(0, 100)}...
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <form action={approveRevision.bind(null, rev.id)}>
                                            <Button size="sm" className="w-full bg-green-600 hover:bg-green-700">Approve</Button>
                                        </form>
                                        <form action={rejectRevision.bind(null, rev.id)}>
                                            <Button size="sm" variant="destructive" className="w-full">Reject</Button>
                                        </form>
                                        <Link href={`/admin/revision/${rev.id}`}>
                                            <Button size="sm" variant="outline" className="w-full">View Diff</Button>
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
