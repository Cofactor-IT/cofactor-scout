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
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { proposeInstitute, proposeLab } from './structure-actions'
import { useToast } from "@/components/ui/use-toast"

interface ProposeStructureModalProps {
    type: 'institute' | 'lab'
    parentId: string // universityId or instituteId
}

export function ProposeStructureModal({ type, parentId }: ProposeStructureModalProps) {
    const [open, setOpen] = useState(false)
    const [name, setName] = useState('')
    const router = useRouter()
    const { toast } = useToast()

    const handlePropose = async () => {
        if (!name) return

        const formData = new FormData()
        formData.set('name', name)

        try {
            if (type === 'institute') {
                formData.set('universityId', parentId)
                await proposeInstitute(formData)
            } else {
                formData.set('instituteId', parentId)
                await proposeLab(formData)
            }

            setOpen(false)
            setName('')
            toast({
                title: "Proposal Submitted",
                description: `Your ${type} proposal has been submitted for approval.`,
            })
            router.refresh()
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Something went wrong",
                variant: "destructive"
            })
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">Propose {type === 'institute' ? 'Institute' : 'Lab'}</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Propose new {type === 'institute' ? 'Institute' : 'Lab'}</DialogTitle>
                    <DialogDescription>
                        Enter the name for the new {type}. It will require admin approval.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                            Name
                        </Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="col-span-3"
                            autoFocus
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handlePropose}>Submit Proposal</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
