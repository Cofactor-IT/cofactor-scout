'use client'

import { useState } from 'react'
import { approveScoutApplication, rejectScoutApplication } from '@/actions/admin.actions'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export function AdminScoutReviewClient({ applications }: { applications: any[] }) {
    const [apps, setApps] = useState(applications)
    const [loadingId, setLoadingId] = useState<string | null>(null)
    const [rejectFeedback, setRejectFeedback] = useState<{ [key: string]: string }>({})

    const handleApprove = async (userId: string) => {
        setLoadingId(userId)
        try {
            const res = await approveScoutApplication(userId)
            if (res.success) {
                setApps(prev => prev.filter(app => app.id !== userId))
                alert('Success! Scout approved.')
            } else {
                alert(res.error || 'Failed to approve scout.')
            }
        } catch (e: any) {
            alert(e.message || 'Error')
        }
        setLoadingId(null)
    }

    const handleReject = async (userId: string) => {
        setLoadingId(userId)
        try {
            const feedback = rejectFeedback[userId]
            const res = await rejectScoutApplication(userId, feedback)
            if (res.success) {
                setApps(prev => prev.filter(app => app.id !== userId))
                alert('Success! Scout rejected.')
            } else {
                alert(res.error || 'Failed to reject scout.')
            }
        } catch (e: any) {
            alert(e.message || 'Error')
        }
        setLoadingId(null)
    }

    if (apps.length === 0) {
        return (
            <div className="bg-white p-12 rounded-lg shadow-sm border border-gray-100 text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">No pending applications</h3>
                <p className="text-gray-500">You&apos;ve caught up on all scout reviews.</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {apps.map((app) => (
                <Card key={app.id} className="p-0">
                    <div className="p-6 pb-4">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-xl font-bold">{app.fullName}</h3>
                                <p className="text-sm text-gray-500 mt-1">
                                    <a href={`mailto:${app.email}`} className="hover:underline">{app.email}</a>
                                    {' • '}
                                    Applied on {new Date(app.scoutApplicationDate).toLocaleDateString()}
                                </p>
                            </div>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                Pending
                            </span>
                        </div>
                    </div>
                    <div className="p-6 pt-0">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <h4 className="text-sm font-semibold text-gray-900 mb-2">Academic Profile</h4>
                                <ul className="space-y-2 text-sm text-gray-600">
                                    <li><strong>University:</strong> {app.university}</li>
                                    <li><strong>Department:</strong> {app.department}</li>
                                    <li><strong>Role:</strong> {app.userRole === 'OTHER' ? app.userRoleOther : app.userRole}</li>
                                    <li><strong>LinkedIn:</strong> {app.linkedinUrl ? <a href={app.linkedinUrl} target="_blank" rel="noreferrer" className="text-[#0D7377] hover:underline">Profile</a> : 'N/A'}</li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="text-sm font-semibold text-gray-900 mb-2">Research Focus</h4>
                                <p className="text-sm text-gray-600">{app.researchAreas}</p>
                            </div>
                        </div>

                        <div className="space-y-4 mb-6">
                            <div>
                                <h4 className="text-sm font-semibold text-gray-900 mb-1">Why do they want to be a scout?</h4>
                                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">{app.whyScout}</p>
                            </div>
                            <div>
                                <h4 className="text-sm font-semibold text-gray-900 mb-1">How do they source leads?</h4>
                                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">{app.howSourceLeads}</p>
                            </div>
                        </div>

                        <div className="border-t pt-4 mt-6 border-gray-100">
                            <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4">
                                <div className="flex-1 flex space-x-2 sm:mr-4">
                                    <input
                                        type="text"
                                        placeholder="Optional rejection feedback..."
                                        className="flex-1 text-sm rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2 border"
                                        value={rejectFeedback[app.id] || ''}
                                        onChange={(e) => setRejectFeedback({ ...rejectFeedback, [app.id]: e.target.value })}
                                    />
                                </div>
                                <Button
                                    variant="secondary"
                                    className="!text-red-600 !border-red-600 hover:!bg-red-50 hover:!text-red-700 h-10 px-6 py-2"
                                    onClick={() => handleReject(app.id)}
                                    disabled={loadingId === app.id}
                                >
                                    {loadingId === app.id ? 'Processing...' : 'Reject'}
                                </Button>
                                <Button
                                    className="h-10 px-6 py-2"
                                    onClick={() => handleApprove(app.id)}
                                    disabled={loadingId === app.id}
                                >
                                    {loadingId === app.id ? 'Processing...' : 'Approve Application'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    )
}
