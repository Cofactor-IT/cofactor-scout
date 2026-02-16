'use client'

import { useState, useTransition, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { updatePublicProfile, getLabsForInstitute } from '@/actions/profile-settings.actions'

interface Institute {
    id: string
    name: string
}

interface Lab {
    id: string
    name: string
}

interface PublicProfileData {
    role?: string | null
    fieldOfStudy?: string | null
    bio?: string | null
    linkedin?: string | null
    twitter?: string | null
    website?: string | null
    instituteId?: string | null
    labId?: string | null
}

interface PublicProfileSettingsProps {
    isPublic: boolean
    publicProfile: PublicProfileData | null
    institutes: Institute[]
}

export function PublicProfileSettings({
    isPublic: initialIsPublic,
    publicProfile,
    institutes
}: PublicProfileSettingsProps) {
    const [isPublic, setIsPublic] = useState(initialIsPublic)
    const [role, setRole] = useState(publicProfile?.role || '')
    const [fieldOfStudy, setFieldOfStudy] = useState(publicProfile?.fieldOfStudy || '')
    const [bio, setBio] = useState(publicProfile?.bio || '')
    const [linkedin, setLinkedin] = useState(publicProfile?.linkedin || '')
    const [twitter, setTwitter] = useState(publicProfile?.twitter || '')
    const [website, setWebsite] = useState(publicProfile?.website || '')
    const [instituteId, setInstituteId] = useState(publicProfile?.instituteId || '')
    const [labId, setLabId] = useState(publicProfile?.labId || '')
    const [labs, setLabs] = useState<Lab[]>([])
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)
    const [isPending, startTransition] = useTransition()
    const [isLoadingLabs, setIsLoadingLabs] = useState(false)

    // Load labs when institute changes
    useEffect(() => {
        if (instituteId) {
            setIsLoadingLabs(true)
            getLabsForInstitute(instituteId).then((fetchedLabs) => {
                setLabs(fetchedLabs)
                setIsLoadingLabs(false)
                // Clear lab selection if it's not in the new institute's labs
                if (!fetchedLabs.find(l => l.id === labId)) {
                    setLabId('')
                }
            })
        } else {
            setLabs([])
            setLabId('')
        }
    }, [instituteId])

    const handleToggle = (checked: boolean) => {
        setIsPublic(checked)
        setError(null)
        setSuccess(null)

        if (!checked) {
            // Immediately disable public profile
            startTransition(async () => {
                const result = await updatePublicProfile(false)
                if (result.error) {
                    setError(result.error)
                    setIsPublic(true) // Revert
                } else {
                    setSuccess('Public profile disabled')
                }
            })
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setSuccess(null)

        startTransition(async () => {
            const result = await updatePublicProfile(true, {
                role: role || undefined,
                fieldOfStudy: fieldOfStudy || undefined,
                bio: bio || undefined,
                linkedin: linkedin || undefined,
                twitter: twitter || undefined,
                website: website || undefined,
                instituteId: instituteId || undefined,
                labId: labId || undefined
            })
            if (result.error) {
                setError(result.error)
            } else {
                setSuccess('Public profile updated successfully')
            }
        })
    }

    return (
        <div className="space-y-6">
            {/* Toggle Section */}
            <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
                <div>
                    <h4 className="font-medium">Public Profile</h4>
                    <p className="text-sm text-muted-foreground">
                        Make yourself visible and taggable in wiki articles
                    </p>
                </div>
                <Switch
                    checked={isPublic}
                    onCheckedChange={handleToggle}
                    disabled={isPending}
                />
            </div>

            {/* Public Profile Form - Only shown when enabled */}
            {isPublic && (
                <form onSubmit={handleSubmit} className="space-y-4 border rounded-lg p-4">
                    <p className="text-sm text-muted-foreground mb-4">
                        Fill in your public profile details. Others will be able to see this information and tag you in wiki articles.
                    </p>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="role">Role</Label>
                            <Input
                                id="role"
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                placeholder="e.g. Researcher, PhD Student"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="fieldOfStudy">Field of Study</Label>
                            <Input
                                id="fieldOfStudy"
                                value={fieldOfStudy}
                                onChange={(e) => setFieldOfStudy(e.target.value)}
                                placeholder="e.g. Neuroscience"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="publicBio">Bio / Facts</Label>
                        <Textarea
                            id="publicBio"
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            placeholder="Short bio or key facts..."
                            rows={3}
                        />
                    </div>

                    <div className="border-t pt-4 mt-4">
                        <Label className="mb-3 block">Social Media</Label>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="linkedin" className="text-xs">LinkedIn</Label>
                                <Input
                                    id="linkedin"
                                    value={linkedin}
                                    onChange={(e) => setLinkedin(e.target.value)}
                                    placeholder="Profile URL"
                                    className="h-9"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="twitter" className="text-xs">Twitter/X</Label>
                                <Input
                                    id="twitter"
                                    value={twitter}
                                    onChange={(e) => setTwitter(e.target.value)}
                                    placeholder="Profile URL"
                                    className="h-9"
                                />
                            </div>

                            <div className="space-y-2 sm:col-span-2">
                                <Label htmlFor="website" className="text-xs">Website</Label>
                                <Input
                                    id="website"
                                    value={website}
                                    onChange={(e) => setWebsite(e.target.value)}
                                    placeholder="Personal site or portfolio"
                                    className="h-9"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="border-t pt-4 mt-4">
                        <Label className="mb-3 block">Affiliation</Label>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="institute" className="text-xs">Institute</Label>
                                <select
                                    id="institute"
                                    value={instituteId}
                                    onChange={(e) => setInstituteId(e.target.value)}
                                    className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm"
                                >
                                    <option value="">Select institute...</option>
                                    {institutes.map((inst) => (
                                        <option key={inst.id} value={inst.id}>
                                            {inst.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="lab" className="text-xs">Lab</Label>
                                <select
                                    id="lab"
                                    value={labId}
                                    onChange={(e) => setLabId(e.target.value)}
                                    className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm"
                                    disabled={!instituteId || isLoadingLabs}
                                >
                                    <option value="">
                                        {isLoadingLabs ? 'Loading...' : 'Select lab...'}
                                    </option>
                                    {labs.map((lab) => (
                                        <option key={lab.id} value={lab.id}>
                                            {lab.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {error && <p className="text-sm text-destructive">{error}</p>}
                    {success && <p className="text-sm text-green-600">{success}</p>}

                    <Button type="submit" disabled={isPending} className="w-full">
                        {isPending ? 'Saving...' : 'Save Public Profile'}
                    </Button>
                </form>
            )}

            {!isPublic && success && (
                <p className="text-sm text-green-600">{success}</p>
            )}
            {!isPublic && error && (
                <p className="text-sm text-destructive">{error}</p>
            )}
        </div>
    )
}
