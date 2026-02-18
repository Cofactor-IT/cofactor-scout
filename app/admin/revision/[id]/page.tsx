import { redirect } from 'next/navigation'

/**
 * DEPRECATED: Wiki revision system has been removed
 */
export default async function RevisionPage() {
    redirect('/admin/dashboard')
}
