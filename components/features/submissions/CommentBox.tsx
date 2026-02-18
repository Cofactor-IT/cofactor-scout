"use client"

import * as React from "react"
import { Avatar } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

interface User {
    fullName: string
    profilePictureUrl?: string | null
    firstName: string
    lastName: string
    preferredName?: string | null
}

export interface CommentBoxProps {
    user: User
    onSubmit: (content: string) => void
    placeholder?: string
}

export function CommentBox({ user, onSubmit, placeholder }: CommentBoxProps) {
    const [content, setContent] = React.useState('')

    const getInitials = (u: User) => {
        if (u.preferredName) {
            return u.preferredName.substring(0, 2).toUpperCase()
        }
        const first = u.firstName.charAt(0)
        const last = u.lastName.charAt(0) || ''
        return (first + last).toUpperCase()
    }

    const handleSubmit = () => {
        if (content.trim()) {
            onSubmit(content)
            setContent('')
        }
    }

    return (
        <div className="flex gap-4 w-full items-start">
            <Avatar
                src={user.profilePictureUrl}
                initials={getInitials(user)}
                size="md"
            />

            <div className="flex-1 flex flex-col gap-3">
                <Textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder={placeholder || 'Add additional information or a correction...'}
                    rows={3}
                    className="min-h-[96px]" // Override default 120px
                />

                <div className="self-end">
                    <Button
                        variant="primary"
                        onClick={handleSubmit}
                        disabled={!content.trim()}
                        className="w-[160px] h-[40px]"
                    >
                        Post Comment
                    </Button>
                </div>
            </div>
        </div>
    )
}
