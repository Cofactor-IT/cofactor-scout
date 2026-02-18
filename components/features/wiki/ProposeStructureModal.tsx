'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus } from 'lucide-react'

interface ProposeStructureModalProps {
    type: 'lab' | 'institute'
    parentId: string
}

export function ProposeStructureModal({ type, parentId }: ProposeStructureModalProps) {
    const [open, setOpen] = useState(false)
    const [name, setName] = useState('')
    const [isPending, setIsPending] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsPending(true)

        try {
            const response = await fetch('/api/wiki/structure', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type, parentId, name })
            })

            if (response.ok) {
                setOpen(false)
                setName('')
                window.location.reload()
            }
        } catch (error) {
            console.error('Failed to propose structure:', error)
        } finally {
            setIsPending(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Propose {type === 'lab' ? 'Lab' : 'Institute'}
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Propose New {type === 'lab' ? 'Lab' : 'Institute'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder={`Enter ${type} name`}
                            required
                        />
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isPending}>
                            {isPending ? 'Proposing...' : 'Propose'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
