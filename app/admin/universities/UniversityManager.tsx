'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useActionState, useState, useTransition } from 'react'
import { createUniversity, deleteUniversity, approveUniversity, updateUniversity } from './actions'

type University = {
    id: string
    name: string
    domains: string[]
    approved: boolean
    createdAt: Date
    _count: { users: number }
}

export function UniversityManager({ universities }: { universities: University[] }) {
    const [domains, setDomains] = useState<string[]>([''])
    const [createState, createAction, isCreating] = useActionState(createUniversity, { error: undefined })

    // Edit state
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editName, setEditName] = useState('')
    const [editDomains, setEditDomains] = useState<string[]>([''])
    const [isPending, startTransition] = useTransition()
    const [editError, setEditError] = useState<string | null>(null)

    const addDomainField = () => {
        setDomains([...domains, ''])
    }

    const removeDomainField = (index: number) => {
        setDomains(domains.filter((_, i) => i !== index))
    }

    const updateDomain = (index: number, value: string) => {
        const newDomains = [...domains]
        newDomains[index] = value
        setDomains(newDomains)
    }

    // Edit domain handlers
    const addEditDomainField = () => {
        setEditDomains([...editDomains, ''])
    }

    const removeEditDomainField = (index: number) => {
        if (editDomains.length > 1) {
            setEditDomains(editDomains.filter((_, i) => i !== index))
        }
    }

    const updateEditDomain = (index: number, value: string) => {
        const newDomains = [...editDomains]
        newDomains[index] = value
        setEditDomains(newDomains)
    }

    const startEdit = (uni: University) => {
        setEditingId(uni.id)
        setEditName(uni.name)
        setEditDomains(uni.domains.length > 0 ? [...uni.domains] : [''])
        setEditError(null)
    }

    const cancelEdit = () => {
        setEditingId(null)
        setEditName('')
        setEditDomains([''])
        setEditError(null)
    }

    const saveEdit = async () => {
        if (!editingId) return

        const validDomains = editDomains.filter(d => d.trim())
        if (!editName.trim()) {
            setEditError('University name is required')
            return
        }
        if (validDomains.length === 0) {
            setEditError('At least one domain is required')
            return
        }

        startTransition(async () => {
            try {
                await updateUniversity(editingId, editName.trim(), validDomains)
                setEditingId(null)
                setEditError(null)
            } catch (e) {
                setEditError(e instanceof Error ? e.message : 'Failed to update university')
            }
        })
    }

    const handleSubmit = async (formData: FormData) => {
        // Add all non-empty domains to form data
        domains.filter(d => d.trim()).forEach((domain, i) => {
            formData.append(`domain_${i}`, domain.trim().toLowerCase())
        })
        await createAction(formData)
        // Reset form on success
        if (!createState?.error) {
            setDomains([''])
        }
    }

    const approvedUniversities = universities.filter(u => u.approved)
    const pendingUniversities = universities.filter(u => !u.approved)

    return (
        <div className="space-y-8">
            {/* Create New University */}
            <Card>
                <CardHeader>
                    <CardTitle>Add New University</CardTitle>
                    <CardDescription>Create a university with one or more email domains.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">University Name</Label>
                            <Input id="name" name="name" placeholder="e.g., Technical University of Berlin" required />
                        </div>

                        <div className="space-y-2">
                            <Label>Email Domains</Label>
                            {domains.map((domain, index) => (
                                <div key={index} className="flex gap-2">
                                    <Input
                                        value={domain}
                                        onChange={(e) => updateDomain(index, e.target.value)}
                                        placeholder="e.g., tu-berlin.de"
                                    />
                                    {domains.length > 1 && (
                                        <Button type="button" variant="outline" size="icon" onClick={() => removeDomainField(index)}>
                                            ✕
                                        </Button>
                                    )}
                                </div>
                            ))}
                            <Button type="button" variant="outline" size="sm" onClick={addDomainField}>
                                + Add Domain
                            </Button>
                        </div>

                        {createState?.error && (
                            <p className="text-sm text-destructive">{createState.error}</p>
                        )}

                        <Button type="submit" disabled={isCreating}>
                            {isCreating ? 'Creating...' : 'Create University'}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* Pending Universities */}
            {pendingUniversities.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Pending Approval ({pendingUniversities.length})</CardTitle>
                        <CardDescription>Universities suggested by users during signup.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Domains</TableHead>
                                    <TableHead>Students</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {pendingUniversities.map((uni) => (
                                    <TableRow key={uni.id}>
                                        <TableCell className="font-medium">{uni.name}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-1">
                                                {uni.domains.map((d, i) => (
                                                    <Badge key={i} variant="outline">{d}</Badge>
                                                ))}
                                            </div>
                                        </TableCell>
                                        <TableCell>{uni._count.users}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button size="sm" variant="outline" onClick={() => startEdit(uni)}>
                                                    Edit
                                                </Button>
                                                <form action={approveUniversity.bind(null, uni.id)}>
                                                    <Button size="sm" className="bg-green-600 hover:bg-green-700">Approve</Button>
                                                </form>
                                                <form action={deleteUniversity.bind(null, uni.id)}>
                                                    <Button size="sm" variant="destructive">Delete</Button>
                                                </form>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}

            {/* Edit Modal/Card */}
            {editingId && (
                <Card className="border-2 border-primary">
                    <CardHeader>
                        <CardTitle>Edit University</CardTitle>
                        <CardDescription>Update university name and email domains.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="editName">University Name</Label>
                                <Input
                                    id="editName"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    placeholder="University name"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Email Domains</Label>
                                {editDomains.map((domain, index) => (
                                    <div key={index} className="flex gap-2">
                                        <Input
                                            value={domain}
                                            onChange={(e) => updateEditDomain(index, e.target.value)}
                                            placeholder="e.g., uni.edu"
                                        />
                                        {editDomains.length > 1 && (
                                            <Button type="button" variant="outline" size="icon" onClick={() => removeEditDomainField(index)}>
                                                ✕
                                            </Button>
                                        )}
                                    </div>
                                ))}
                                <Button type="button" variant="outline" size="sm" onClick={addEditDomainField}>
                                    + Add Domain
                                </Button>
                            </div>

                            {editError && (
                                <p className="text-sm text-destructive">{editError}</p>
                            )}

                            <div className="flex gap-2">
                                <Button onClick={saveEdit} disabled={isPending}>
                                    {isPending ? 'Saving...' : 'Save Changes'}
                                </Button>
                                <Button variant="outline" onClick={cancelEdit}>
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* All Universities */}
            <Card>
                <CardHeader>
                    <CardTitle>All Universities ({approvedUniversities.length})</CardTitle>
                    <CardDescription>Approved universities in the system.</CardDescription>
                </CardHeader>
                <CardContent>
                    {approvedUniversities.length === 0 ? (
                        <p className="text-muted-foreground">No universities yet. Create one above.</p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Domains</TableHead>
                                    <TableHead>Students</TableHead>
                                    <TableHead>Created</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {approvedUniversities.map((uni) => (
                                    <TableRow key={uni.id}>
                                        <TableCell className="font-medium">{uni.name}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-1">
                                                {uni.domains.map((d, i) => (
                                                    <Badge key={i} variant="secondary">{d}</Badge>
                                                ))}
                                            </div>
                                        </TableCell>
                                        <TableCell>{uni._count.users}</TableCell>
                                        <TableCell className="text-muted-foreground text-sm">
                                            {new Date(uni.createdAt).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button size="sm" variant="outline" onClick={() => startEdit(uni)}>
                                                    Edit
                                                </Button>
                                                <form action={deleteUniversity.bind(null, uni.id)}>
                                                    <Button size="sm" variant="outline">Delete</Button>
                                                </form>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
