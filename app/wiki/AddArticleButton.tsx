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

export function AddArticleButton({ universityId, instituteId, labId }: { universityId?: string | null, instituteId?: string | null, labId?: string | null }) {
    const [open, setOpen] = useState(false)
    const [title, setTitle] = useState('')
    const router = useRouter()

    const handleCreate = () => {
        if (!title) return

        // Simple slugify: lowercase, replace spaces with dashes, remove special chars
        const slug = title
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '')

        if (slug) {
            setOpen(false)
            const query = new URLSearchParams()
            query.set('title', title)
            if (universityId) query.set('universityId', universityId)
            if (instituteId) query.set('instituteId', instituteId)
            if (labId) query.set('labId', labId)

            router.push(`/wiki/${slug}/edit?${query.toString()}`)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>Add Article</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create New Article</DialogTitle>
                    <DialogDescription>
                        Enter the title for your new wiki article.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="title" className="text-right">
                            Title
                        </Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="col-span-3"
                            autoFocus
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleCreate()
                            }}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleCreate}>Create</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
