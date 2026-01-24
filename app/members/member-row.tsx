'use client'

import { useState } from 'react'
import { Role } from '@prisma/client'

export function RoleForm({ memberId, currentRole, currentUserId }: { memberId: string, currentRole: Role, currentUserId: string }) {
    const [isDisabled] = useState(memberId === currentUserId)

    async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
        const form = e.target.closest('form') as HTMLFormElement
        if (form) form.requestSubmit()
    }

    return (
        <form action="/api/members/update-role" method="POST" className="inline">
            <input type="hidden" name="userId" value={memberId} />
            <select
                name="role"
                className={`h-8 rounded px-2 text-sm border-0 cursor-pointer ${currentRole === 'ADMIN' ? 'bg-red-500/20 text-red-500' :
                    currentRole === 'STAFF' ? 'bg-blue-500/20 text-blue-500' :
                        currentRole === 'PENDING_STAFF' ? 'bg-yellow-500/20 text-yellow-500' :
                            'bg-gray-500/20 text-gray-500'
                    }`}
                onChange={handleChange}
                disabled={isDisabled}
            >
                <option value="STUDENT" selected={currentRole === 'STUDENT'}>
                    Student
                </option>
                <option value="STAFF" selected={currentRole === 'STAFF'}>
                    Staff Editor
                </option>
                <option value="PENDING_STAFF" selected={currentRole === 'PENDING_STAFF'}>
                    Pending Staff
                </option>
                <option value="ADMIN" selected={currentRole === 'ADMIN'}>
                    Admin
                </option>
            </select>
        </form>
    )
}

export function ActionButtons({ memberId, userName, userEmail, currentUserId }: { memberId: string, userName: string | null, userEmail: string, currentUserId: string }) {
    const handleDelete = (e: React.FormEvent) => {
        if (!confirm(`Are you sure you want to delete ${userName || userEmail}? This action cannot be undone.`)) {
            e.preventDefault()
        }
    }

    const isSelf = memberId === currentUserId

    return (
        <div className="flex flex-col gap-2">
            <a
                href={`mailto:${userEmail}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline inline-block w-full"
            >
                Email
            </a>
            <div className="flex gap-2">
                <form action="/api/members/reset-password" method="POST" className="inline">
                    <input type="hidden" name="userId" value={memberId} />
                    <button
                        type="submit"
                        className="text-xs text-yellow-600 hover:underline disabled:opacity-50"
                        disabled={isSelf}
                    >
                        Reset PW
                    </button>
                </form>
                <form action="/api/members/delete-user" method="POST" className="inline" onSubmit={handleDelete}>
                    <input type="hidden" name="userId" value={memberId} />
                    <button
                        type="submit"
                        className="text-xs text-red-500 hover:underline disabled:opacity-50"
                        disabled={isSelf}
                    >
                        Delete
                    </button>
                </form>
            </div>
        </div>
    )
}

export function MemberReferrals({ referrals }: { referrals: Array<{ referee: { id: string; name: string | null; email: string } }> }) {
    return (
        <td className="px-4 py-3 text-center">
            <div className="font-medium">{referrals.length}</div>
            {referrals.length > 0 && (
                <details className="text-xs">
                    <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                        View names
                    </summary>
                    <div className="absolute z-10 bg-popover border rounded p-2 mt-1 shadow-lg max-w-48">
                        {referrals.map(ref => (
                            <div key={ref.referee.id} className="text-xs">
                                {ref.referee.name} ({ref.referee.email})
                            </div>
                        ))}
                    </div>
                </details>
            )}
        </td>
    )
}

export function MemberRevisions({ revisions, stats }: { revisions: Array<{ id: string; status: string; uniPage: { slug: string; name: string } }>, stats: { totalRevisions: number; approvedRevisions: number; pendingRevisions: number; rejectedRevisions: number } }) {
    return (
        <td className="px-4 py-3 text-center">
            <div className="text-sm">
                <div className="font-medium">{stats.totalRevisions}</div>
                <div className="text-xs text-muted-foreground">
                    <span className="text-green-500">{stats.approvedRevisions}</span> /
                    <span className="text-yellow-500">{stats.pendingRevisions}</span> /
                    <span className="text-red-500">{stats.rejectedRevisions}</span>
                </div>
            </div>
            {stats.totalRevisions > 0 && (
                <details className="text-xs">
                    <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                        View pages
                    </summary>
                    <div className="absolute z-10 bg-popover border rounded p-2 mt-1 shadow-lg max-h-48 overflow-auto">
                        {revisions.map(rev => (
                            <div key={rev.id} className="text-xs whitespace-nowrap">
                                <span className={`px-1 rounded ${rev.status === 'APPROVED' ? 'bg-green-500/20 text-green-500' :
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
    )
}
