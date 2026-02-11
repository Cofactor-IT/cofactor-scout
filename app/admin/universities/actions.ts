'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth'

/**
 * Create a new university - ADMIN ONLY
 */
export async function createUniversity(prevState: { error?: string } | undefined, formData: FormData) {
    await requireAdmin()

    const name = formData.get('name') as string
    if (!name?.trim()) {
        return { error: 'University name is required' }
    }

    // Collect all domains from form data
    const domains: string[] = []
    for (const [key, value] of formData.entries()) {
        if (key.startsWith('domain_') && typeof value === 'string' && value.trim()) {
            domains.push(value.trim().toLowerCase())
        }
    }

    if (domains.length === 0) {
        return { error: 'At least one email domain is required' }
    }

    // Check for duplicate university name
    const existingName = await prisma.university.findUnique({
        where: { name: name.trim() }
    })
    if (existingName) {
        return { error: 'A university with this name already exists' }
    }

    // Check for duplicate domains
    const existingUniversitiesWithDomains = await prisma.university.findMany({
        where: {
            domains: { hasSome: domains }
        }
    })

    if (existingUniversitiesWithDomains.length > 0) {
        for (const domain of domains) {
            const match = existingUniversitiesWithDomains.find(u => u.domains.includes(domain))
            if (match) {
                return { error: `Domain "${domain}" is already registered to ${match.name}` }
            }
        }
    }

    await prisma.university.create({
        data: {
            name: name.trim(),
            domains,
            approved: true
        }
    })

    revalidatePath('/admin/universities')
    return { error: undefined }
}

/**
 * Delete a university - ADMIN ONLY
 */
export async function deleteUniversity(universityId: string) {
    await requireAdmin()

    // First, unlink all users from this university
    await prisma.user.updateMany({
        where: { universityId },
        data: { universityId: null }
    })

    // Then delete the university
    await prisma.university.delete({
        where: { id: universityId }
    })

    revalidatePath('/admin/universities')
    revalidatePath('/admin/dashboard')
}

/**
 * Approve a user-suggested university - ADMIN ONLY
 */
export async function approveUniversity(universityId: string) {
    await requireAdmin()

    await prisma.university.update({
        where: { id: universityId },
        data: { approved: true }
    })

    revalidatePath('/admin/universities')
    revalidatePath('/admin/dashboard')
}

/**
 * Update a university - ADMIN ONLY
 */
export async function updateUniversity(universityId: string, name: string, domains: string[], logo?: string | null) {
    await requireAdmin()

    if (!name?.trim()) {
        throw new Error('University name is required')
    }

    if (domains.length === 0) {
        throw new Error('At least one email domain is required')
    }

    // Check for duplicate name (excluding current university)
    const existingName = await prisma.university.findFirst({
        where: {
            name: name.trim(),
            NOT: { id: universityId }
        }
    })
    if (existingName) {
        throw new Error('A university with this name already exists')
    }

    // Check for duplicate domains (excluding current university)
    const normalizedDomainsForCheck = domains.map(d => d.toLowerCase())
    const existingUniversitiesWithDomains = await prisma.university.findMany({
        where: {
            domains: { hasSome: normalizedDomainsForCheck },
            NOT: { id: universityId }
        }
    })

    if (existingUniversitiesWithDomains.length > 0) {
        for (const domain of domains) {
            const match = existingUniversitiesWithDomains.find(u => u.domains.includes(domain.toLowerCase()))
            if (match) {
                throw new Error(`Domain "${domain}" is already registered to ${match.name}`)
            }
        }
    }

    // Build update data
    const updateData: { name: string; domains: string[]; logo?: string | null } = {
        name: name.trim(),
        domains: domains.map(d => d.toLowerCase())
    }

    // Only update logo if explicitly provided (including null to remove)
    if (logo !== undefined) {
        updateData.logo = logo
    }

    await prisma.university.update({
        where: { id: universityId },
        data: updateData
    })

    revalidatePath('/admin/universities')
    revalidatePath('/wiki')
}

/**
 * Bulk import universities - ADMIN ONLY
 */
export async function importUniversities(universities: { name: string, domains: string[] }[]) {
    await requireAdmin()

    const results = {
        successCount: 0,
        errors: [] as string[]
    }

    for (const uni of universities) {
        try {
            // Basic validation
            if (!uni.name?.trim()) continue
            if (uni.domains.length === 0) continue

            // Check if name exists
            const existingName = await prisma.university.findUnique({
                where: { name: uni.name.trim() }
            })

            if (existingName) {
                // If name exists, check if we should add new domains?
                // For now, let's just log error that it exists
                results.errors.push(`University "${uni.name}" already exists`)
                continue
            }

            // Check if domains exist
            const existingUnisWithDomains = await prisma.university.findMany({
                where: { domains: { hasSome: uni.domains } }
            })

            if (existingUnisWithDomains.length > 0) {
                let domainExists = false
                for (const domain of uni.domains) {
                    const match = existingUnisWithDomains.find(u => u.domains.includes(domain))
                    if (match) {
                        results.errors.push(`Domain "${domain}" is already registered to ${match.name}`)
                        domainExists = true
                        break
                    }
                }
                if (domainExists) continue
            }

            // Create
            await prisma.university.create({
                data: {
                    name: uni.name.trim(),
                    domains: uni.domains,
                    approved: true
                }
            })
            results.successCount++

        } catch (e) {
            console.error('Import error for', uni.name, e)
            results.errors.push(`Failed to import "${uni.name}"`)
        }
    }

    revalidatePath('/admin/universities')
    return results
}
