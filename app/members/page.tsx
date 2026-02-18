import { redirect } from 'next/navigation'

/**
 * DEPRECATED: Members page references removed models (WikiRevision, UniPage) and fields (isTrusted)
 */
export default function MembersPage() {
    redirect('/admin/dashboard')
}
