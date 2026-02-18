'use client'

import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updatePerson, deletePerson } from '@/actions/wiki-people.actions'
import { Pencil, Trash2 } from 'lucide-react'

interface Person {
    id: string
    name: string
    role: string | null
    fieldOfStudy: string | null
    bio: string | null
    linkedin: string | null

    website: string | null
}

interface EditPersonModalProps {
    person: Person
    contextId: string
    contextType: 'institute' | 'lab'
}

export function EditPersonModal({ person, contextId, contextType }: EditPersonModalProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setLoading(true)

        const formData = new FormData(event.currentTarget)
        formData.set('id', person.id)
        if (contextType === 'institute') {
            formData.set('instituteId', contextId)
        } else {
            formData.set('labId', contextId)
        }

        try {
            await updatePerson(formData)
            setOpen(false)
            router.refresh()
        } catch (error) {
            console.error(error)
            alert(error instanceof Error ? error.message : "Failed to update person")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Pencil className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px] overflow-y-auto max-h-[80vh]">
                <DialogHeader>
                    <DialogTitle>Edit Person</DialogTitle>
                    <DialogDescription>
                        Update the details for {person.name}.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={onSubmit} className="space-y-4">
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">Name</Label>
                            <Input id="name" name="name" className="col-span-3" defaultValue={person.name} required />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="role" className="text-right">Role</Label>
                            <Input id="role" name="role" className="col-span-3" defaultValue={person.role || ''} placeholder="e.g. Researcher, PhD Student" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="fieldOfStudy" className="text-right">Field</Label>
                            <Input id="fieldOfStudy" name="fieldOfStudy" className="col-span-3" defaultValue={person.fieldOfStudy || ''} placeholder="e.g. Neuroscience" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="bio" className="text-right">Bio / Facts</Label>
                            <Textarea id="bio" name="bio" className="col-span-3" defaultValue={person.bio || ''} placeholder="Short bio or key facts..." />
                        </div>

                        <div className="border-t pt-2 mt-2">
                            <Label className="mb-2 block">Social Media</Label>
                            <div className="space-y-2">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="linkedin" className="text-right text-xs">LinkedIn</Label>
                                    <Input id="linkedin" name="linkedin" className="col-span-3 h-8" defaultValue={person.linkedin || ''} placeholder="Profile URL" />
                                </div>

                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="website" className="text-right text-xs">Website</Label>
                                    <Input id="website" name="website" className="col-span-3 h-8" defaultValue={person.website || ''} placeholder="Personal site or portfolio" />
                                </div>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

interface DeletePersonButtonProps {
    personId: string
    personName: string
}

export function DeletePersonButton({ personId, personName }: DeletePersonButtonProps) {
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    async function handleDelete() {
        setLoading(true)
        try {
            await deletePerson(personId)
            router.refresh()
        } catch (error) {
            console.error(error)
            alert(error instanceof Error ? error.message : "Failed to delete person")
        } finally {
            setLoading(false)
        }
    }

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete {personName}?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete this person from the directory.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} disabled={loading} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        {loading ? 'Deleting...' : 'Delete'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
