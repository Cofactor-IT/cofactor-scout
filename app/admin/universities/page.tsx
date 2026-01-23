import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'
import { UniversityManager } from './UniversityManager'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'

export default async function UniversitiesPage() {
    await requireAdmin()

    const universities = await prisma.university.findMany({
        orderBy: [
            { approved: 'asc' }, // Pending first
            { name: 'asc' }
        ],
        include: {
            _count: {
                select: { users: true }
            }
        }
    })

    return (
        <div className="container mx-auto py-10 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-4xl font-bold">Manage Universities</h1>
                    <p className="text-muted-foreground">Add and manage universities with their email domains.</p>
                </div>
                <Link href="/admin/dashboard">
                    <Button variant="outline">← Back to Dashboard</Button>
                </Link>
            </div>

            <UniversityManager universities={universities} />
        </div>
    )
}
