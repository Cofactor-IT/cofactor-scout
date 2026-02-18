"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"

interface Draft {
    id: string
    researcherName?: string | null
    researchTopic?: string | null
    updatedAt: Date | string
}

export interface DraftRowProps {
    draft: Draft
    onContinue: (id: string) => void
    onDelete: (id: string) => void
}

export function DraftRow({ draft, onContinue, onDelete }: DraftRowProps) {
    const formatDate = (date: Date | string) => {
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        }).format(new Date(date))
    }

    return (
        <tr className="h-[72px] border-b border-light-gray bg-white">
            <td className="px-6 font-body text-[14px] align-middle">
                {draft.researcherName ? (
                    <span className="text-navy">{draft.researcherName}</span>
                ) : (
                    <span className="text-cool-gray italic">(No researcher added yet)</span>
                )}
            </td>
            <td className="px-6 font-body text-[14px] align-middle">
                {draft.researchTopic ? (
                    <span className="text-navy">{draft.researchTopic}</span>
                ) : (
                    <span className="text-cool-gray italic">(Untitled)</span>
                )}
            </td>
            <td className="px-6 font-body font-normal text-[14px] text-navy align-middle">
                {formatDate(draft.updatedAt)}
            </td>
            <td className="px-6 align-middle text-right">
                <div className="flex items-center justify-end gap-4">
                    <Button
                        variant="primary"
                        size="sm"
                        onClick={() => onContinue(draft.id)}
                    >
                        Continue
                    </Button>
                    <button
                        className="font-heading font-normal text-[14px] text-red underline hover:text-[#DC2626] transition-colors"
                        onClick={() => onDelete(draft.id)}
                    >
                        Delete
                    </button>
                </div>
            </td>
        </tr>
    )
}
