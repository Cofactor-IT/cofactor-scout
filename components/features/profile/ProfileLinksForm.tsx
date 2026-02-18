'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updateProfileLinks } from '@/actions/profile-settings.actions'

export function ProfileLinksForm({ initialLinkedin, initialWebsite }: { initialLinkedin?: string | null, initialWebsite?: string | null }) {
    const [linkedin, setLinkedin] = useState(initialLinkedin || '')
    const [website, setWebsite] = useState(initialWebsite || '')
    const [isLoading, setIsLoading] = useState(false)
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null)

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setIsLoading(true)
        setMessage(null)

        try {
            const result = await updateProfileLinks(linkedin, website)
            if (result && result.error) {
                setMessage({ text: result.error, type: 'error' })
            } else {
                setMessage({ text: 'Links updated successfully', type: 'success' })
            }
        } catch (error) {
            setMessage({ text: 'Failed to update links', type: 'error' })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="linkedin">LinkedIn URL</Label>
                <Input
                    id="linkedin"
                    placeholder="https://linkedin.com/in/..."
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="website">Personal Website</Label>
                <Input
                    id="website"
                    placeholder="https://example.com"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                />
            </div>

            {message && (
                <p className={`text-sm ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                    {message.text}
                </p>
            )}

            <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? 'Saving...' : 'Save Links'}
            </Button>
        </form>
    )
}
