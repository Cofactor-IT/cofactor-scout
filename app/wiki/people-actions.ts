'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-config"
import { redirect } from 'next/navigation'

export async function addPerson(formData: FormData) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) redirect('/api/auth/signin')

    const name = formData.get('name') as string
    const role = formData.get('role') as string
    const fieldOfStudy = formData.get('fieldOfStudy') as string
    const bio = formData.get('bio') as string
    const linkedin = formData.get('linkedin') as string
    const twitter = formData.get('twitter') as string
    const website = formData.get('website') as string

    const instituteId = formData.get('instituteId') as string
    const labId = formData.get('labId') as string

    if (!name || (!instituteId && !labId)) {
        throw new Error("Missing required fields (Name and Context)")
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true, role: true, universityId: true }
    })

    if (!user) throw new Error("User not found")

    // Access Check logic
    // We need to verify that the user belongs to the university that owns this institute/lab
    let universityId = ''

    if (instituteId) {
        const inst = await prisma.institute.findUnique({ where: { id: instituteId } })
        if (inst) universityId = inst.universityId
    } else if (labId) {
        const lab = await prisma.lab.findUnique({
            where: { id: labId },
            include: { institute: true }
        })
        if (lab) universityId = lab.institute.universityId
    }

    const isAdmin = user.role === 'ADMIN' || user.role === 'STAFF'
    if (!isAdmin && user.universityId !== universityId) {
        throw new Error("Unauthorized access")
    }

    // Generate slug from name
    let baseSlug = name.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')  // Remove special chars
        .replace(/\s+/g, '-')           // Replace spaces with dashes
        .replace(/-+/g, '-')            // Collapse multiple dashes
        .trim()

    // Check if slug exists and add random suffix if needed
    let slug = baseSlug
    let attempts = 0
    while (attempts < 10) {
        const existing = await prisma.person.findUnique({ where: { slug } })
        if (!existing) break
        // Add random 4-char suffix
        const suffix = Math.random().toString(36).substring(2, 6)
        slug = `${baseSlug}-${suffix}`
        attempts++
    }

    await prisma.person.create({
        data: {
            name,
            slug,
            role,
            fieldOfStudy,
            bio,
            linkedin,
            twitter,
            website,
            instituteId: instituteId || null,
            labId: labId || null
        }
    })

    if (instituteId) {
        // Maybe redirect or revalidate institute page
    }

    // We should probably redirect back to referer or appropriate slug
    // For now returning success so client can refresh/redirect
    return { success: true }
}

export async function updatePerson(formData: FormData) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) redirect('/api/auth/signin')

    const id = formData.get('id') as string
    const name = formData.get('name') as string
    const role = formData.get('role') as string
    const fieldOfStudy = formData.get('fieldOfStudy') as string
    const bio = formData.get('bio') as string
    const linkedin = formData.get('linkedin') as string
    const twitter = formData.get('twitter') as string
    const website = formData.get('website') as string

    if (!id || !name) {
        throw new Error("Missing required fields (ID and Name)")
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true, role: true, universityId: true }
    })

    if (!user) throw new Error("User not found")

    // Get the person and check ownership
    const person = await prisma.person.findUnique({
        where: { id },
        include: {
            institute: true,
            lab: { include: { institute: true } }
        }
    })

    if (!person) throw new Error("Person not found")

    // Determine university from the person's institute or lab
    let universityId = ''
    if (person.institute) {
        universityId = person.institute.universityId
    } else if (person.lab) {
        universityId = person.lab.institute.universityId
    }

    const isAdmin = user.role === 'ADMIN' || user.role === 'STAFF'
    if (!isAdmin && user.universityId !== universityId) {
        throw new Error("Unauthorized access")
    }

    await prisma.person.update({
        where: { id },
        data: {
            name,
            role: role || null,
            fieldOfStudy: fieldOfStudy || null,
            bio: bio || null,
            linkedin: linkedin || null,
            twitter: twitter || null,
            website: website || null
        }
    })

    return { success: true }
}

export async function deletePerson(id: string) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) redirect('/api/auth/signin')

    if (!id) {
        throw new Error("Missing person ID")
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true, role: true, universityId: true }
    })

    if (!user) throw new Error("User not found")

    // Get the person and check ownership
    const person = await prisma.person.findUnique({
        where: { id },
        include: {
            institute: true,
            lab: { include: { institute: true } }
        }
    })

    if (!person) throw new Error("Person not found")

    // Determine university from the person's institute or lab
    let universityId = ''
    if (person.institute) {
        universityId = person.institute.universityId
    } else if (person.lab) {
        universityId = person.lab.institute.universityId
    }

    const isAdmin = user.role === 'ADMIN' || user.role === 'STAFF'
    if (!isAdmin && user.universityId !== universityId) {
        throw new Error("Unauthorized access")
    }

    await prisma.person.delete({
        where: { id }
    })

    return { success: true }
}

