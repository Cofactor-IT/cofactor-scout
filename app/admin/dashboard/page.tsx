import { prisma } from '@/lib/database/prisma'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import Link from 'next/link'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
    try {
        const [
            totalUsers,
            totalSubmissions,
            pendingSubmissions,
            recentSignups,
            topContributors
        ] = await Promise.all([
            prisma.user.count(),
            prisma.researchSubmission.count(),
            prisma.researchSubmission.count({ where: { status: 'PENDING_RESEARCH' } }),
            prisma.user.findMany({
                orderBy: { createdAt: 'desc' },
                take: 5
            }),
            prisma.user.findMany({
                orderBy: { totalSubmissions: 'desc' },
                take: 10,
                select: {
                    id: true,
                    fullName: true,
                    email: true,
                    role: true,
                    totalSubmissions: true,
                    approvedSubmissions: true,
                    createdAt: true
                }
            })
        ])


        return (
            <div className="container mx-auto py-10 space-y-8">
                <div className="flex justify-between items-center">
                    <h1 className="text-4xl font-bold">Admin Dashboard</h1>
                    <div className="flex gap-2">
                        <Link href="/admin/settings">
                            <Button variant="outline">Settings</Button>
                        </Link>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4 text-muted-foreground"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalUsers}</div>
                            <p className="text-xs text-muted-foreground">Registered scouts</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4 text-muted-foreground"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalSubmissions}</div>
                            <p className="text-xs text-muted-foreground">Research leads submitted</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4 text-muted-foreground"><path d="M12 2v20M2 12h20" /></svg>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{pendingSubmissions}</div>
                            <p className="text-xs text-muted-foreground">Awaiting validation</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                    {/* Top Contributors */}
                    <Card className="col-span-4">
                        <CardHeader>
                            <CardTitle>Top Contributors</CardTitle>
                            <CardDescription>Most active scouts by submissions.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[100px]">Rank</TableHead>
                                        <TableHead>Scout</TableHead>
                                        <TableHead>Role</TableHead>
                                        <TableHead className="text-right">Submissions</TableHead>
                                        <TableHead className="text-right">Approved</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {topContributors.map((user, i) => (
                                        <TableRow key={user.id}>
                                            <TableCell className="font-medium">#{i + 1}</TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span>{user.fullName}</span>
                                                    <span className="text-xs text-muted-foreground">{user.email}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={user.role === 'ADMIN' ? 'destructive' : user.role === 'SCOUT' ? 'default' : 'secondary'}>
                                                    {user.role}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">{user.totalSubmissions}</TableCell>
                                            <TableCell className="text-right">{user.approvedSubmissions}</TableCell>
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
                            <CardDescription>Newest scouts in the network.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-8">
                                {recentSignups.map((user) => (
                                    <div key={user.id} className="flex items-center">
                                        <div className="ml-4 space-y-1">
                                            <p className="text-sm font-medium leading-none">{user.fullName}</p>
                                            <p className="text-sm text-muted-foreground mb-1">{user.email}</p>
                                            <Badge variant={user.role === 'ADMIN' ? 'destructive' : user.role === 'SCOUT' ? 'default' : 'secondary'} className="text-[10px] h-5">
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
            </div>
        )
    } catch (error) {
        logger.error('Failed to load dashboard data', { error })
        throw error
    }
}
