import { prisma } from '@/lib/prisma'
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-config"
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { Role } from '@prisma/client'
import { randomBytes } from 'crypto'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'

// Generate a secure random token
function generateToken(): string {
    return randomBytes(32).toString('hex')
}

// Server action to update user role
export async function updateRole(formData: FormData) {
    'use server'

    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
        throw new Error('Unauthorized')
    }

    const userId = formData.get('userId') as string
    const newRole = formData.get('role') as Role

    if (!userId || !newRole) {
        throw new Error('Missing required fields')
    }

    // Prevent admin from changing their own role
    if (userId === session.user.id) {
        throw new Error('Cannot change your own role')
    }

    await prisma.user.update({
        where: { id: userId },
        data: { role: newRole }
    })

    revalidatePath('/members')
}

// Server action to delete a user
export async function deleteUser(formData: FormData) {
    'use server'

    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
        throw new Error('Unauthorized')
    }

    const userId = formData.get('userId') as string

    if (!userId) {
        throw new Error('Missing user ID')
    }

    // Prevent admin from deleting themselves
    if (userId === session.user.id) {
        throw new Error('Cannot delete your own account')
    }

    // Delete user (cascade will handle related records)
    await prisma.user.delete({
        where: { id: userId }
    })

    logger.info('User deleted by admin', { deletedUserId: userId, adminId: session.user.id })

    revalidatePath('/members')
}

// Server action to request password reset for a user
export async function requestPasswordResetForUser(formData: FormData) {
    'use server'

    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
        throw new Error('Unauthorized')
    }

    const userId = formData.get('userId') as string

    if (!userId) {
        throw new Error('Missing user ID')
    }

    const user = await prisma.user.findUnique({
        where: { id: userId }
    })

    if (!user) {
        throw new Error('User not found')
    }

    // Generate reset token (expires in 1 hour)
    const resetToken = generateToken()
    const expires = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    // Delete any existing tokens for this user
    await prisma.passwordReset.deleteMany({
        where: { userId: user.id }
    })

    // Create new reset token
    await prisma.passwordReset.create({
        data: {
            token: resetToken,
            userId: user.id,
            expires
        }
    })

    // Send reset email (Non-blocking)
    const { sendPasswordResetEmail } = await import('@/lib/email')
    sendPasswordResetEmail(user.email, resetToken).catch(err =>
        logger.error('Failed to send password reset email', { email: user.email, error: err })
    )

    logger.info('Password reset requested by admin', { targetUserId: userId, adminId: session.user.id })
}

export default async function MembersPage() {
    // Admin only access
    const session = await getServerSession(authOptions)
    if (!session?.user?.role || session.user.role !== 'ADMIN') {
        redirect('/api/auth/signin?error=AccessDenied')
    }

    const members = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            referredBy: {
                select: {
                    referrer: {
                        select: {
                            name: true,
                            email: true,
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
                            email: true,
                            createdAt: true
                        }
                    }
                }
            },
            revisions: {
                select: {
                    id: true,
                    status: true,
                    createdAt: true,
                    uniPage: {
                        select: {
                            slug: true,
                            name: true
                        }
                    }
                }
            }
        }
    })

    // Calculate stats for each member
    const membersWithStats = members.map(member => {
        const approvedRevisions = member.revisions.filter(r => r.status === 'APPROVED')
        const pendingRevisions = member.revisions.filter(r => r.status === 'PENDING')
        const rejectedRevisions = member.revisions.filter(r => r.status === 'REJECTED')

        return {
            ...member,
            stats: {
                totalRevisions: member.revisions.length,
                approvedRevisions: approvedRevisions.length,
                pendingRevisions: pendingRevisions.length,
                rejectedRevisions: rejectedRevisions.length
            }
        }
    })

    return (
        <div className="container mx-auto py-10">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-4xl font-bold">Admin Members Directory</h1>
                    <p className="text-muted-foreground mt-2">
                        Manage all {members.length} members, roles, and view detailed metrics.
                    </p>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid gap-4 md:grid-cols-4 mb-8">
                <div className="p-4 border rounded-lg">
                    <div className="text-2xl font-bold">{members.length}</div>
                    <div className="text-sm text-muted-foreground">Total Members</div>
                </div>
                <div className="p-4 border rounded-lg">
                    <div className="text-2xl font-bold">{members.filter(m => m.role === 'STUDENT').length}</div>
                    <div className="text-sm text-muted-foreground">Students</div>
                </div>
                <div className="p-4 border rounded-lg">
                    <div className="text-2xl font-bold">{members.filter(m => m.role === 'STAFF').length}</div>
                    <div className="text-sm text-muted-foreground">Staff</div>
                </div>
                <div className="p-4 border rounded-lg">
                    <div className="text-2xl font-bold">{members.filter(m => m.role === 'ADMIN').length}</div>
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
                                        <form action={updateRole} className="inline">
                                            <input type="hidden" name="userId" value={member.id} />
                                            <select
                                                name="role"
                                                className={`h-8 rounded px-2 text-sm border-0 cursor-pointer ${
                                                    member.role === 'ADMIN' ? 'bg-red-500/20 text-red-500' :
                                                    member.role === 'STAFF' ? 'bg-blue-500/20 text-blue-500' :
                                                    member.role === 'PENDING_STAFF' ? 'bg-yellow-500/20 text-yellow-500' :
                                                    'bg-gray-500/20 text-gray-500'
                                                }`}
                                                onChange={(e) => {
                                                    const form = e.target.closest('form')
                                                    if (form) form.requestSubmit()
                                                }}
                                                disabled={member.id === session.user.id}
                                            >
                                                <option value="STUDENT" selected={member.role === 'STUDENT'}>
                                                    Student
                                                </option>
                                                <option value="STAFF" selected={member.role === 'STAFF'}>
                                                    Staff Editor
                                                </option>
                                                <option value="PENDING_STAFF" selected={member.role === 'PENDING_STAFF'}>
                                                    Pending Staff
                                                </option>
                                                <option value="ADMIN" selected={member.role === 'ADMIN'}>
                                                    Admin
                                                </option>
                                            </select>
                                        </form>
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
                                        <div className="flex flex-col gap-2">
                                            <a
                                                href={`mailto:${member.email}`}
                                                className="text-blue-500 hover:underline"
                                            >
                                                Email
                                            </a>
                                            <div className="flex gap-2">
                                                <form action={requestPasswordResetForUser} className="inline">
                                                    <input type="hidden" name="userId" value={member.id} />
                                                    <button
                                                        type="submit"
                                                        className="text-xs text-yellow-600 hover:underline disabled:opacity-50"
                                                        disabled={member.id === session.user.id}
                                                    >
                                                        Reset PW
                                                    </button>
                                                </form>
                                                <form action={deleteUser} className="inline"
                                                    onSubmit={(e) => {
                                                        if (!confirm(`Are you sure you want to delete ${member.name || member.email}? This action cannot be undone.`)) {
                                                            e.preventDefault()
                                                        }
                                                    }}
                                                >
                                                    <input type="hidden" name="userId" value={member.id} />
                                                    <button
                                                        type="submit"
                                                        className="text-xs text-red-500 hover:underline disabled:opacity-50"
                                                        disabled={member.id === session.user.id}
                                                    >
                                                        Delete
                                                    </button>
                                                </form>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

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
