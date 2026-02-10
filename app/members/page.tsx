import { prisma } from '@/lib/prisma'
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-config"
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { RoleForm, ActionButtons } from './member-row'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function MembersPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
    // Admin only access
    const session = await getServerSession(authOptions)
    if (!session?.user?.role || session.user.role !== 'ADMIN') {
        redirect('/api/auth/signin?error=AccessDenied')
    }

    const params = await searchParams
    const page = parseInt(params.page || '1', 10)
    const limit = 20
    const skip = (page - 1) * limit

    const [members, totalCount, studentCount, staffCount, adminCount] = await Promise.all([
        prisma.user.findMany({
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                referralCode: true,
                powerScore: true,
                emailVerified: true,
                createdAt: true,
                referredBy: {
                    select: {
                        referrer: {
                            select: {
                                name: true,
                                referralCode: true
                            }
                        }
                    }
                },
                referralsMade: {
                    select: {
                        referee: {
                            select: {
                                id: true,
                                name: true,
                                email: true
                            }
                        }
                    }
                },
                revisions: {
                    select: {
                        id: true,
                        status: true,
                        uniPage: {
                            select: {
                                name: true
                            }
                        }
                    }
                },
                _count: {
                    select: {
                        revisions: {
                            where: { status: 'APPROVED' }
                        }
                    }
                }
            },
            take: limit,
            skip: skip
        }),
        prisma.user.count(),
        prisma.user.count({ where: { role: 'STUDENT' } }),
        prisma.user.count({ where: { role: 'STAFF' } }),
        prisma.user.count({ where: { role: 'ADMIN' } })
    ])

    const totalPages = Math.ceil(totalCount / limit)
    const currentPage = Math.max(1, Math.min(page, totalPages || 1))

    const membersWithStats = members.map(member => ({
        ...member,
        stats: {
            totalRevisions: member.revisions.length,
            approvedRevisions: member._count.revisions,
            pendingRevisions: member.revisions.filter(r => r.status === 'PENDING').length,
            rejectedRevisions: member.revisions.filter(r => r.status === 'REJECTED').length
        }
    }))

    return (
        <div className="container mx-auto py-10">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-4xl font-bold">Admin Members Directory</h1>
                    <p className="text-muted-foreground mt-2">
                        Manage all {totalCount} members, roles, and view detailed metrics.
                    </p>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid gap-4 md:grid-cols-4 mb-8">
                <div className="p-4 border rounded-lg">
                    <div className="text-2xl font-bold">{totalCount}</div>
                    <div className="text-sm text-muted-foreground">Total Members</div>
                </div>
                <div className="p-4 border rounded-lg">
                    <div className="text-2xl font-bold">{studentCount}</div>
                    <div className="text-sm text-muted-foreground">Students</div>
                </div>
                <div className="p-4 border rounded-lg">
                    <div className="text-2xl font-bold">{staffCount}</div>
                    <div className="text-sm text-muted-foreground">Staff</div>
                </div>
                <div className="p-4 border rounded-lg">
                    <div className="text-2xl font-bold">{adminCount}</div>
                    <div className="text-sm text-muted-foreground">Admins</div>
                </div>
            </div>

            {/* Members Table */}
            <div className="border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-muted">
                            <tr>
                                <th className="px-4 py-3 text-left text-sm font-medium">User</th>
                                <th className="px-4 py-3 text-left text-sm font-medium">Role</th>
                                <th className="px-4 py-3 text-left text-sm font-medium">Joined</th>
                                <th className="px-4 py-3 text-left text-sm font-medium">Referred By</th>
                                <th className="px-4 py-3 text-center text-sm font-medium">Referrals</th>
                                <th className="px-4 py-3 text-center text-sm font-medium">Wiki Edits</th>
                                <th className="px-4 py-3 text-center text-sm font-medium">Power Score</th>
                                <th className="px-4 py-3 text-center text-sm font-medium">Email Verified</th>
                                <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {membersWithStats.map((member) => (
                                <tr key={member.id} className="hover:bg-muted/50">
                                    <td className="px-4 py-3">
                                        <div>
                                            <div className="font-medium">{member.name || 'Anonymous'}</div>
                                            <div className="text-sm text-muted-foreground">{member.email}</div>
                                            <div className="text-xs text-muted-foreground mt-1">
                                                Code: <code className="bg-muted px-1 rounded">{member.referralCode}</code>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <RoleForm
                                            memberId={member.id}
                                            currentRole={member.role}
                                            currentUserId={session.user.id}
                                        />
                                    </td>
                                    <td className="px-4 py-3 text-sm">
                                        {new Date(member.createdAt).toLocaleDateString()}
                                        <br />
                                        <span className="text-xs text-muted-foreground">
                                            {new Date(member.createdAt).toLocaleTimeString()}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm">
                                        {member.referredBy?.referrer ? (
                                            <div>
                                                <div>{member.referredBy.referrer.name}</div>
                                                <div className="text-xs text-muted-foreground">
                                                    ({member.referredBy.referrer.referralCode})
                                                </div>
                                            </div>
                                        ) : (
                                            <span className="text-muted-foreground">None</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <div className="font-medium">{member.referralsMade.length}</div>
                                        {member.referralsMade.length > 0 && (
                                            <details className="text-xs">
                                                <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                                                    View names
                                                </summary>
                                                <div className="absolute z-10 bg-popover border rounded p-2 mt-1 shadow-lg max-w-48">
                                                    {member.referralsMade.map(ref => (
                                                        <div key={ref.referee.id} className="text-xs">
                                                            {ref.referee.name} ({ref.referee.email})
                                                        </div>
                                                    ))}
                                                </div>
                                            </details>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <div className="text-sm">
                                            <div className="font-medium">{member.stats.totalRevisions}</div>
                                            <div className="text-xs text-muted-foreground">
                                                <span className="text-green-500">{member.stats.approvedRevisions}</span> /
                                                <span className="text-yellow-500">{member.stats.pendingRevisions}</span> /
                                                <span className="text-red-500">{member.stats.rejectedRevisions}</span>
                                            </div>
                                        </div>
                                        {member.stats.totalRevisions > 0 && (
                                            <details className="text-xs">
                                                <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                                                    View pages
                                                </summary>
                                                <div className="absolute z-10 bg-popover border rounded p-2 mt-1 shadow-lg max-h-48 overflow-auto">
                                                    {member.revisions.map(rev => (
                                                        <div key={rev.id} className="text-xs whitespace-nowrap">
                                                            <span className={`px-1 rounded ${
                                                                rev.status === 'APPROVED' ? 'bg-green-500/20 text-green-500' :
                                                                rev.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-500' :
                                                                'bg-red-500/20 text-red-500'
                                                            }`}>
                                                                {rev.status}
                                                            </span>
                                                            {' '}{rev.uniPage.name}
                                                        </div>
                                                    ))}
                                                </div>
                                            </details>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <span className="font-bold text-purple-500">{member.powerScore}</span>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        {member.emailVerified ? (
                                            <span className="text-green-500 text-sm">✓ Yes</span>
                                        ) : (
                                            <span className="text-red-500 text-sm">✗ No</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-sm">
                                        <ActionButtons
                                            memberId={member.id}
                                            userName={member.name}
                                            userEmail={member.email}
                                            currentUserId={session.user.id}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                    <div className="text-sm text-muted-foreground">
                        Showing {((currentPage - 1) * limit) + 1} to {Math.min(currentPage * limit, totalCount)} of {totalCount} members
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={currentPage === 1}
                            asChild={currentPage > 1}
                        >
                            {currentPage > 1 ? (
                                <Link href={`/members?page=${currentPage - 1}`}>
                                    <ChevronLeft className="h-4 w-4 mr-1" />
                                    Previous
                                </Link>
                            ) : (
                                <>
                                    <ChevronLeft className="h-4 w-4 mr-1" />
                                    Previous
                                </>
                            )}
                        </Button>
                        <div className="flex items-center gap-1">
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                let pageNum
                                if (totalPages <= 5) {
                                    pageNum = i + 1
                                } else if (currentPage <= 3) {
                                    pageNum = i + 1
                                } else if (currentPage >= totalPages - 2) {
                                    pageNum = totalPages - 4 + i
                                } else {
                                    pageNum = currentPage - 2 + i
                                }
                                return (
                                    <Button
                                        key={pageNum}
                                        variant={currentPage === pageNum ? "default" : "outline"}
                                        size="sm"
                                        asChild
                                    >
                                        <Link href={`/members?page=${pageNum}`}>{pageNum}</Link>
                                    </Button>
                                )
                            })}
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={currentPage === totalPages}
                            asChild={currentPage < totalPages}
                        >
                            {currentPage < totalPages ? (
                                <Link href={`/members?page=${currentPage + 1}`}>
                                    Next
                                    <ChevronRight className="h-4 w-4 ml-1" />
                                </Link>
                            ) : (
                                <>
                                    Next
                                    <ChevronRight className="h-4 w-4 ml-1" />
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            )}

            {/* Legend */}
            <div className="mt-6 p-4 border rounded-lg bg-muted/50">
                <h3 className="font-medium mb-2">Legend:</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div><span className="text-green-500">Green</span> - Approved edits</div>
                    <div><span className="text-yellow-500">Yellow</span> - Pending edits</div>
                    <div><span className="text-red-500">Red</span> - Rejected edits</div>
                    <div><span className="text-purple-500">Purple</span> - Power Score</div>
                </div>
                <div className="mt-3 text-sm text-muted-foreground">
                    <strong>Roles:</strong> Student (regular member) → Staff Editor (can edit wiki) → Admin (full access)
                </div>
            </div>
        </div>
    )
}
