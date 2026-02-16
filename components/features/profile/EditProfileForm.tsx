'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { updateUserProfile } from '../settings-actions'

interface EditProfileFormProps {
    initialName: string
    initialBio: string | null
}

export function EditProfileForm({ initialName, initialBio }: EditProfileFormProps) {
    const [name, setName] = useState(initialName || '')
    const [bio, setBio] = useState(initialBio || '')
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)
    const [isPending, startTransition] = useTransition()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setSuccess(null)

        startTransition(async () => {
            const result = await updateUserProfile(name, bio)
            if (result.error) {
                setError(result.error)
            } else {
                setSuccess('Profile updated successfully')
            }
        })
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="name">Display Name</Label>
                <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your display name"
                    required
                    minLength={2}
                    maxLength={100}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="bio">Bio / Description</Label>
                <Textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell us about yourself..."
                    rows={4}
                    maxLength={1000}
                />
                <p className="text-xs text-muted-foreground text-right">
                    {bio.length}/1000 characters
                </p>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
            {success && <p className="text-sm text-green-600">{success}</p>}

            <Button type="submit" disabled={isPending}>
                {isPending ? 'Saving...' : 'Save Changes'}
            </Button>
        </form>
    )
}
