"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { StatusBadge, StatusVariant } from "@/components/ui/status-badge"

interface Submission {
    id: string
    researcherName: string
    researchTopic: string
    status: string // We'll cast this to StatusVariant
    submittedAt: Date | string
}

export interface SubmissionRowProps {
    submission: Submission
    onView: (id: string) => void
}

export function SubmissionRow({ submission, onView }: SubmissionRowProps) {
    const formatDate = (date: Date | string) => {
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        }).format(new Date(date))
    }

    const formatStatus = (status: string) => {
        const map: Record<string, string> = {
            PENDING_RESEARCH: 'Pending Research',
            VALIDATING: 'Validating',
            PITCHED_MATCHMAKING: 'Pitched/Matchmaking',
            MATCH_MADE: 'Match Made',
        }
        return map[status] || status
    }

    // Map DB status to Badge variant
    const getVariant = (status: string): StatusVariant => {
        const map: Record<string, StatusVariant> = {
            PENDING_RESEARCH: 'pending',
            VALIDATING: 'validating',
            PITCHED_MATCHMAKING: 'pitched',
            MATCH_MADE: 'match',
        }
        return map[status] || 'pending'
    }


    return (
        <tr
            className="h-[72px] border-b border-light-gray hover:bg-[#F9FAFB] cursor-pointer transition-colors"
            onClick={() => onView(submission.id)}
        >
            <td className="px-6 font-body font-normal text-[14px] text-navy align-middle">
                {submission.researcherName}
            </td>
            <td className="px-6 font-body font-normal text-[14px] text-navy align-middle">
                {submission.researchTopic}
            </td>
            <td className="px-6 align-middle">
                <StatusBadge variant={getVariant(submission.status)}>
                    {formatStatus(submission.status)}
                </StatusBadge>
            </td>
            <td className="px-6 font-body font-normal text-[14px] text-navy align-middle">
                {formatDate(submission.submittedAt)}
            </td>
            <td className="px-6 align-middle text-right">
                <Button
                    variant="primary"
                    size="sm"
                    onClick={(e) => {
                        e.stopPropagation()
                        onView(submission.id)
                    }}
                >
                    View
                </Button>
            </td>
        </tr>
    )
}
