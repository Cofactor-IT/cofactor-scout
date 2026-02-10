import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { AddStaffDomainForm } from './AddStaffDomainForm'
import { removeStaffDomain } from './actions'
import { requireAdmin } from '@/lib/auth'
import { getSystemSettings } from '@/lib/settings'
import { NotificationSettingsForm } from '@/components/admin/NotificationSettingsForm'

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
    await requireAdmin()

    const staffDomains = await prisma.staffDomain.findMany({
        orderBy: { createdAt: 'desc' }
    })

    const settings = await getSystemSettings()

    return (
        <div className="container mx-auto py-10 space-y-8">
            <h1 className="text-4xl font-bold">Admin Settings</h1>

            <NotificationSettingsForm initialSettings={settings} />

            <Card>
                <CardHeader>
                    <CardTitle>Staff Domains</CardTitle>
                    <CardDescription>
                        Users signing up with an email from these domains will automatically be assigned the STAFF role.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        <AddStaffDomainForm />

                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Domain</TableHead>
                                        <TableHead>Added At</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {staffDomains.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={3} className="text-center text-muted-foreground h-24">
                                                No staff domains configured.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        staffDomains.map((domain) => (
                                            <TableRow key={domain.id}>
                                                <TableCell className="font-medium">{domain.domain}</TableCell>
                                                <TableCell>{new Date(domain.createdAt).toLocaleDateString()}</TableCell>
                                                <TableCell className="text-right">
                                                    <form action={removeStaffDomain.bind(null, domain.id)}>
                                                        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive/90">
                                                            Remove
                                                        </Button>
                                                    </form>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
