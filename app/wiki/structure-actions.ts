'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-config"
import { redirect } from 'next/navigation'

// Helper to slugify names
function slugify(text: string) {
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start of text
        .replace(/-+$/, '');            // Trim - from end of text
}

export async function proposeInstitute(formData: FormData) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) redirect('/api/auth/signin')

    const name = formData.get('name') as string
    const universityId = formData.get('universityId') as string

    if (!name || !universityId) {
        throw new Error("Missing required fields")
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email }
    })

    if (!user) throw new Error("User not found")

    // Check if user belongs to this university (unless admin)
    const isAdmin = user.role === 'ADMIN' || user.role === 'STAFF'
    if (!isAdmin && user.universityId !== universityId) {
        throw new Error("You can only propose institutes for your own university")
    }

    const slug = slugify(name)

    // Check uniqueness
    const existing = await prisma.institute.findFirst({
        where: {
            universityId,
            slug
        }
    })

    if (existing) {
        throw new Error("An institute with this name already exists")
    }

    await prisma.institute.create({
        data: {
            name,
            slug,
            universityId,
            approved: isAdmin // Auto-approve if admin
        }
    })

    revalidatePath('/wiki')
    return { success: true }
}

export async function proposeLab(formData: FormData) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) redirect('/api/auth/signin')

    const name = formData.get('name') as string
    const instituteId = formData.get('instituteId') as string

    if (!name || !instituteId) {
        throw new Error("Missing required fields")
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email }
    })

    if (!user) throw new Error("User not found")

    // Verify institute access (Student check)
    const institute = await prisma.institute.findUnique({
        where: { id: instituteId }
    })

    if (!institute) throw new Error("Institute not found")

    const isAdmin = user.role === 'ADMIN' || user.role === 'STAFF'
    if (!isAdmin && user.universityId !== institute.universityId) {
        throw new Error("You can only propose labs for your own university")
    }

    const slug = slugify(name)

    const existing = await prisma.lab.findFirst({
        where: {
            instituteId,
            slug
        }
    })

    if (existing) {
        throw new Error("A lab with this name already exists")
    }

    await prisma.lab.create({
        data: {
            name,
            slug,
            instituteId,
            approved: isAdmin
        }
    })

    revalidatePath(`/wiki/institutes/${institute.slug}`)
    return { success: true }
}
