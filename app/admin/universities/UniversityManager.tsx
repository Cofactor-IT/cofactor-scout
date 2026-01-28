'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useActionState, useState, useTransition, useRef } from 'react'
import { createUniversity, deleteUniversity, approveUniversity, updateUniversity, importUniversities } from './actions'
import { Textarea } from '@/components/ui/textarea'
import Image from 'next/image'

type University = {
    id: string
    name: string
    domains: string[]
    logo: string | null
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
    const [editLogo, setEditLogo] = useState<string | null>(null)
    const [isPending, startTransition] = useTransition()
    const [editError, setEditError] = useState<string | null>(null)

    // Logo upload state
    const [isUploading, setIsUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Import state
    const [importText, setImportText] = useState('')
    const [isImporting, setIsImporting] = useState(false)
    const [importResult, setImportResult] = useState<{ success: number, errors: string[] } | null>(null)

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
        setEditLogo(uni.logo)
        setEditError(null)
    }

    const cancelEdit = () => {
        setEditingId(null)
        setEditName('')
        setEditDomains([''])
        setEditLogo(null)
        setEditError(null)
    }

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file || !editingId) return

        setIsUploading(true)
        setEditError(null)

        try {
            const formData = new FormData()
            formData.append('file', file)
            formData.append('universityId', editingId)

            const response = await fetch('/api/admin/universities/upload-logo', {
                method: 'POST',
                body: formData
            })

            const result = await response.json()

            if (!response.ok) {
                setEditError(result.error || 'Upload failed')
                return
            }

            setEditLogo(result.path)
        } catch {
            setEditError('Failed to upload logo')
        } finally {
            setIsUploading(false)
            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }
        }
    }

    const removeLogo = () => {
        setEditLogo(null)
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
                await updateUniversity(editingId, editName.trim(), validDomains, editLogo)
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

    const handleImport = async () => {
        if (!importText.trim()) return

        setIsImporting(true)
        setImportResult(null)

        try {
            const lines = importText.split('\n')
            const universitiesToImport: { name: string, domains: string[] }[] = []

            for (const line of lines) {
                if (!line.trim()) continue

                // Format: University of Oxford;ox.ac.uk;;
                const parts = line.split(';')
                if (parts.length < 2) continue

                const name = parts[0].trim()
                const domain = parts[1].trim()

                if (name && domain) {
                    universitiesToImport.push({
                        name,
                        domains: [domain.toLowerCase()]
                    })
                }
            }

            if (universitiesToImport.length === 0) {
                setImportResult({ success: 0, errors: ['No valid entries found. Format: Name;Domain;;'] })
                setIsImporting(false)
                return
            }

            const result = await importUniversities(universitiesToImport)
            setImportResult({
                success: result.successCount,
                errors: result.errors
            })

            if (result.successCount > 0) {
                setImportText('')
            }
        } catch {
            setImportResult({ success: 0, errors: ['Failed to import universities'] })
        } finally {
            setIsImporting(false)
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

            {/* Import Universities */}
            <Card>
                <CardHeader>
                    <CardTitle>Import Universities</CardTitle>
                    <CardDescription>
                        Import from CSV format: <code>University Name;domain.edu;;</code>
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Textarea
                        placeholder={`University of Oxford;ox.ac.uk;;\nUniversity of Cambridge;cam.ac.uk;;`}
                        value={importText}
                        onChange={(e) => setImportText(e.target.value)}
                        rows={5}
                        className="font-mono text-sm"
                    />

                    {importResult && (
                        <div className={`text-sm p-3 rounded-md ${importResult.errors.length > 0 ? 'bg-destructive/10 text-destructive' : 'bg-green-50 text-green-700'}`}>
                            <p className="font-medium">Import completed:</p>
                            <ul className="list-disc list-inside mt-1">
                                <li>Successfully imported: {importResult.success}</li>
                                {importResult.errors.slice(0, 5).map((err, i) => (
                                    <li key={i}>{err}</li>
                                ))}
                                {importResult.errors.length > 5 && (
                                    <li>...and {importResult.errors.length - 5} more errors</li>
                                )}
                            </ul>
                        </div>
                    )}

                    <Button onClick={handleImport} disabled={isImporting || !importText.trim()}>
                        {isImporting ? 'Importing...' : 'Import Universities'}
                    </Button>
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
                        <CardDescription>Update university name, email domains, and logo.</CardDescription>
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

                            {/* Logo Upload Section */}
                            <div className="space-y-2">
                                <Label>University Logo</Label>
                                <div className="flex items-center gap-4">
                                    {editLogo ? (
                                        <div className="relative">
                                            <Image
                                                src={editLogo}
                                                alt="University logo"
                                                width={80}
                                                height={80}
                                                className="rounded-lg object-contain border bg-white"
                                                unoptimized
                                            />
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="sm"
                                                className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full"
                                                onClick={removeLogo}
                                            >
                                                ✕
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="w-20 h-20 border-2 border-dashed rounded-lg flex items-center justify-center text-muted-foreground">
                                            📁
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
                                            onChange={handleLogoUpload}
                                            className="hidden"
                                            id="logo-upload"
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={isUploading}
                                        >
                                            {isUploading ? 'Uploading...' : editLogo ? 'Change Logo' : 'Upload Logo'}
                                        </Button>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            PNG, JPG, WEBP, or SVG. Max 2MB.
                                        </p>
                                    </div>
                                </div>
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
                                    <TableHead>Logo</TableHead>
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
                                        <TableCell>
                                            {uni.logo ? (
                                                <Image
                                                    src={uni.logo}
                                                    alt={`${uni.name} logo`}
                                                    width={32}
                                                    height={32}
                                                    className="rounded object-contain"
                                                    unoptimized
                                                />
                                            ) : (
                                                <span className="text-xl">📁</span>
                                            )}
                                        </TableCell>
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
