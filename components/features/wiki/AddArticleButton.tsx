'use client'

import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface AddArticleButtonProps {
    universityId: string
    instituteId?: string
    labId?: string
}

export function AddArticleButton({ universityId, instituteId, labId }: AddArticleButtonProps) {
    const router = useRouter()

    const handleClick = () => {
        const params = new URLSearchParams({ universityId })
        if (instituteId) params.append('instituteId', instituteId)
        if (labId) params.append('labId', labId)
        router.push(`/wiki/new?${params.toString()}`)
    }

    return (
        <Button onClick={handleClick} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Article
        </Button>
    )
}
