"use client"

import * as React from "react"
import { Avatar } from "@/components/ui/avatar"

interface User {
    id: string
    fullName: string
    profilePictureUrl?: string | null
    firstName: string
    lastName: string
    preferredName?: string | null
}

export interface CommentProps {
    comment: {
        id: string
        content: string
        createdAt: Date
        user: User
    }
    currentUserId?: string
    onEdit?: (id: string) => void
    onDelete?: (id: string) => void
}

export function Comment({ comment, currentUserId, onEdit, onDelete }: CommentProps) {
    const isAuthor = currentUserId && comment.user.id === currentUserId

    const getInitials = (u: User) => {
        if (u.preferredName) {
            return u.preferredName.substring(0, 2).toUpperCase()
        }
        const first = u.firstName.charAt(0)
        const last = u.lastName.charAt(0) || ''
        return (first + last).toUpperCase()
    }

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        }).format(date)
    }

    return (
        <div className="flex gap-4 w-full mb-6 items-start">
            <Avatar
                src={comment.user.profilePictureUrl}
                initials={getInitials(comment.user)}
                size="md"
            />

            <div className="flex-1">
                {/* Header */}
                <div className="flex justify-between items-center mb-2">
                    <span className="font-heading font-semibold text-[14px] text-navy">
                        {comment.user.fullName}
                    </span>
                    <span className="font-heading font-normal text-[12px] text-cool-gray">
                        {formatDate(new Date(comment.createdAt))}
                    </span>
                </div>

                {/* Body */}
                <div className="bg-off-white border border-light-gray rounded-sharp p-4 mb-2">
                    <p className="font-body font-normal text-[14px] text-navy leading-relaxed">
                        {comment.content}
                    </p>
                </div>

                {/* Footer Actions */}
                {isAuthor && (onEdit || onDelete) && (
                    <div className="flex gap-4">
                        {onEdit && (
                            <button
                                className="font-heading font-normal text-[12px] text-cool-gray underline hover:text-navy transition-colors"
                                onClick={() => onEdit(comment.id)}
                            >
                                Edit
                            </button>
                        )}
                        {onDelete && (
                            <button
                                className="font-heading font-normal text-[12px] text-red underline hover:text-[#DC2626] transition-colors"
                                onClick={() => onDelete(comment.id)}
                            >
                                Delete
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
