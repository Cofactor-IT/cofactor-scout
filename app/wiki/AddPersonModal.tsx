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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { addPerson } from './people-actions'
import { useToast } from "@/components/ui/use-toast"

interface AddPersonModalProps {
    contextId: string
    contextType: 'institute' | 'lab'
}

export function AddPersonModal({ contextId, contextType }: AddPersonModalProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const { toast } = useToast()

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setLoading(true)

        const formData = new FormData(event.currentTarget)
        if (contextType === 'institute') {
            formData.set('instituteId', contextId)
        } else {
            formData.set('labId', contextId)
        }

        try {
            await addPerson(formData)
            setOpen(false)
            toast({
                title: "Person Added",
                description: "The profile has been successfully added.",
            })
            router.refresh()
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to add person",
                variant: "destructive"
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">Add Person</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px] overflow-y-auto max-h-[80vh]">
                <DialogHeader>
                    <DialogTitle>Add Person to Directory</DialogTitle>
                    <DialogDescription>
                        Fill in the details for the new member.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={onSubmit} className="space-y-4">
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">Name</Label>
                            <Input id="name" name="name" className="col-span-3" required />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="role" className="text-right">Role</Label>
                            <Input id="role" name="role" className="col-span-3" placeholder="e.g. Researcher, PhD Student" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="fieldOfStudy" className="text-right">Field</Label>
                            <Input id="fieldOfStudy" name="fieldOfStudy" className="col-span-3" placeholder="e.g. Neuroscience" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="bio" className="text-right">Bio / Facts</Label>
                            <Textarea id="bio" name="bio" className="col-span-3" placeholder="Short bio or key facts..." />
                        </div>

                        <div className="border-t pt-2 mt-2">
                            <Label className="mb-2 block">Social Media</Label>
                            <div className="space-y-2">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="linkedin" className="text-right text-xs">LinkedIn</Label>
                                    <Input id="linkedin" name="linkedin" className="col-span-3 h-8" placeholder="Profile URL" />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="twitter" className="text-right text-xs">Twitter/X</Label>
                                    <Input id="twitter" name="twitter" className="col-span-3 h-8" placeholder="Profile URL" />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="website" className="text-right text-xs">Website</Label>
                                    <Input id="website" name="website" className="col-span-3 h-8" placeholder="Personal site or portfolio" />
                                </div>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Adding...' : 'Add Person'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
