'use client'

import { useState, useTransition } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { requestSecondaryUniversity, cancelSecondaryRequest } from './actions'

type University = {
    id: string
    name: string
}

type PendingRequest = {
    id: string
    proofText: string
    createdAt: Date
    university: {
        name: string
    }
} | null

interface SecondaryUniversityCardProps {
    universities: University[]
    primaryUniversityId: string | null
    secondaryUniversity: { name: string } | null
    pendingRequest: PendingRequest
}

export function SecondaryUniversityCard({
    universities,
    primaryUniversityId,
    secondaryUniversity,
    pendingRequest
}: SecondaryUniversityCardProps) {
    const [selectedUniversityId, setSelectedUniversityId] = useState('')
    const [proofText, setProofText] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [isPending, startTransition] = useTransition()

    // Filter out primary university from options
    const availableUniversities = universities.filter(u => u.id !== primaryUniversityId)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        startTransition(async () => {
            const result = await requestSecondaryUniversity(selectedUniversityId, proofText)
            if (result.error) {
                setError(result.error)
            } else {
                setSelectedUniversityId('')
                setProofText('')
            }
        })
    }

    const handleCancel = () => {
        if (!pendingRequest) return

        startTransition(async () => {
            const result = await cancelSecondaryRequest(pendingRequest.id)
            if (result.error) {
                setError(result.error)
            }
        })
    }

    // If user already has a secondary university
    if (secondaryUniversity) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Secondary University</CardTitle>
                    <CardDescription>Your additional academic affiliation.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-base py-1 px-3">
                            {secondaryUniversity.name}
                        </Badge>
                        <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400">
                            Approved
                        </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-3">
                        You can view wiki articles and resources from this university.
                    </p>
                </CardContent>
            </Card>
        )
    }

    // If user has a pending request
    if (pendingRequest) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Secondary University Request</CardTitle>
                    <CardDescription>Your request is pending admin approval.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-2">
                        <span className="font-medium">{pendingRequest.university.name}</span>
                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400">
                            Pending
                        </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                        <p className="font-medium mb-1">Your proof:</p>
                        <p className="bg-muted p-2 rounded text-sm">{pendingRequest.proofText}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Submitted on {new Date(pendingRequest.createdAt).toLocaleDateString()}
                    </p>
                    {error && <p className="text-sm text-destructive">{error}</p>}
                    <Button variant="outline" onClick={handleCancel} disabled={isPending}>
                        {isPending ? 'Cancelling...' : 'Cancel Request'}
                    </Button>
                </CardContent>
            </Card>
        )
    }

    // Show request form
    return (
        <Card>
            <CardHeader>
                <CardTitle>Request Secondary University</CardTitle>
                <CardDescription>
                    Request access to another university&apos;s wiki and resources.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="university">Select University</Label>
                        <select
                            id="university"
                            value={selectedUniversityId}
                            onChange={(e) => setSelectedUniversityId(e.target.value)}
                            className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                            required
                        >
                            <option value="">Choose a university...</option>
                            {availableUniversities.map((uni) => (
                                <option key={uni.id} value={uni.id}>
                                    {uni.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="proof">Proof of Affiliation</Label>
                        <Textarea
                            id="proof"
                            value={proofText}
                            onChange={(e) => setProofText(e.target.value)}
                            placeholder="Explain your connection to this university (e.g., exchange program, research collaboration, joint degree program...)"
                            rows={4}
                            required
                            minLength={20}
                        />
                        <p className="text-xs text-muted-foreground">
                            Provide details about why you need access to this university&apos;s resources.
                            An admin will review your request.
                        </p>
                    </div>

                    {error && <p className="text-sm text-destructive">{error}</p>}

                    <Button type="submit" disabled={isPending || !selectedUniversityId || proofText.length < 20}>
                        {isPending ? 'Submitting...' : 'Submit Request'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}
