'use server'

import { prisma } from '@/lib/prisma'
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-config"
import { redirect } from 'next/navigation'
import DOMPurify from 'isomorphic-dompurify'
import { personSchema } from '@/lib/validation'
import {
    sanitizeName,
    sanitizeBio,
    sanitizeString,
    containsSqlInjection
} from '@/lib/sanitization'
import { generateSlug } from '@/lib/utils'
import { validateContent, filterContent } from '@/lib/moderation/content-filter'
import { logger } from '@/lib/logger'
import { getDailyChangeCount } from '@/lib/user-limits'
import { getSystemSettings } from '@/lib/settings'

export async function addPerson(formData: FormData) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) redirect('/api/auth/signin')

    const rawName = formData.get('name') as string
    const rawRole = formData.get('role') as string
    const rawFieldOfStudy = formData.get('fieldOfStudy') as string
    const rawBio = formData.get('bio') as string
    const rawLinkedin = formData.get('linkedin') as string
    const rawTwitter = formData.get('twitter') as string
    const rawWebsite = formData.get('website') as string

    const instituteId = formData.get('instituteId') as string
    const labId = formData.get('labId') as string

    // Validate IDs format
    if (instituteId && !/^[a-z0-9]+$/i.test(instituteId)) {
        throw new Error("Invalid institute ID")
    }
    if (labId && !/^[a-z0-9]+$/i.test(labId)) {
        throw new Error("Invalid lab ID")
    }

    if (!rawName || (!instituteId && !labId)) {
        throw new Error("Missing required fields (Name and Context)")
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true, role: true, universityId: true, isTrusted: true }
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

    // Sanitize inputs
    const nameValidation = sanitizeName(rawName)
    if (!nameValidation.isValid) {
        throw new Error(nameValidation.error || "Invalid name")
    }

    const roleValidation = rawRole ? sanitizeString(rawRole, { maxLength: 100 }) : { sanitized: null, isValid: true, error: undefined }
    if (!roleValidation.isValid) {
        throw new Error(roleValidation.error || "Invalid role")
    }

    const fieldValidation = rawFieldOfStudy ? sanitizeString(rawFieldOfStudy, { maxLength: 200 }) : { sanitized: null, isValid: true, error: undefined }
    if (!fieldValidation.isValid) {
        throw new Error(fieldValidation.error || "Invalid field of study")
    }

    const bioValidation = rawBio ? sanitizeBio(rawBio) : { sanitized: null, isValid: true, error: undefined }
    if (!bioValidation.isValid) {
        throw new Error(bioValidation.error || "Invalid bio")
    }

    // MODERATION CHECK: Validate bio content
    if (bioValidation.sanitized) {
        const contentValidation = validateContent(bioValidation.sanitized, {
            minLength: 0,
            maxLength: 2000,
            checkProfanity: true,
            checkHateSpeech: true,
            checkPii: true
        })

        if (!contentValidation.valid) {
            logger.warn('Person bio rejected by content filter', {
                userId: user.id,
                errors: contentValidation.errors
            })
            throw new Error(`Bio rejected: ${contentValidation.errors.join(', ')}`)
        }

        // Apply content filtering (sanitize profanity)
        const filterResult = filterContent(bioValidation.sanitized)
        if (filterResult.sanitizedContent) {
            bioValidation.sanitized = filterResult.sanitizedContent
        }
    }

    // Validate URL fields using person schema (extract just URL fields)
    const urlFields = {
        linkedin: rawLinkedin || undefined,
        twitter: rawTwitter || undefined,
        website: rawWebsite || undefined
    }

    const urlSchema = personSchema.pick({ linkedin: true, twitter: true, website: true })
    const urlValidation = urlSchema.safeParse(urlFields)
    if (!urlValidation.success) {
        throw new Error("Invalid URL format")
    }

    // Generate slug from name
    let baseSlug = generateSlug(nameValidation.sanitized)
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

    let approved = false
    if (user.id) {
        const isStaff = user.role === 'ADMIN' || user.role === 'STAFF'
        approved = isStaff
        if (!approved && user.isTrusted) {
            const changes = await getDailyChangeCount(user.id)
            const settings = await getSystemSettings()
            if (changes < settings.trustedUserDailyLimit) approved = true
        }
    }

    await prisma.person.create({
        data: {
            name: nameValidation.sanitized,
            slug,
            role: roleValidation.sanitized,
            fieldOfStudy: fieldValidation.sanitized,
            bio: bioValidation.sanitized,
            linkedin: urlValidation.data.linkedin,
            twitter: urlValidation.data.twitter,
            website: urlValidation.data.website,
            instituteId: instituteId || null,
            labId: labId || null,
            approved,
            authorId: user.id
        }
    })

    return { success: true }
}

export async function updatePerson(formData: FormData) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) redirect('/api/auth/signin')

    const id = formData.get('id') as string
    const rawName = formData.get('name') as string
    const rawRole = formData.get('role') as string
    const rawFieldOfStudy = formData.get('fieldOfStudy') as string
    const rawBio = formData.get('bio') as string
    const rawLinkedin = formData.get('linkedin') as string
    const rawTwitter = formData.get('twitter') as string
    const rawWebsite = formData.get('website') as string

    // Validate ID format
    if (!id || !/^[a-z0-9]+$/i.test(id)) {
        throw new Error("Invalid person ID")
    }

    if (!rawName) {
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

    // Validate and sanitize all fields using person schema
    const personData = {
        name: rawName,
        role: rawRole || undefined,
        fieldOfStudy: rawFieldOfStudy || undefined,
        bio: rawBio || undefined,
        linkedin: rawLinkedin || undefined,
        twitter: rawTwitter || undefined,
        website: rawWebsite || undefined
    }

    const validationResult = personSchema.safeParse(personData)
    if (!validationResult.success) {
        const errorMessage = validationResult.error.issues.map((issue: { message: string }) => issue.message).join(', ')
        throw new Error(errorMessage)
    }

    const validatedData = validationResult.data

    // MODERATION CHECK: Validate bio content if provided
    if (validatedData.bio) {
        const contentValidation = validateContent(validatedData.bio, {
            minLength: 0,
            maxLength: 2000,
            checkProfanity: true,
            checkHateSpeech: true,
            checkPii: true
        })

        if (!contentValidation.valid) {
            logger.warn('Person bio update rejected by content filter', {
                userId: user.id,
                personId: id,
                errors: contentValidation.errors
            })
            throw new Error(`Bio rejected: ${contentValidation.errors.join(', ')}`)
        }

        // Apply content filtering (sanitize profanity)
        const filterResult = filterContent(validatedData.bio)
        if (filterResult.sanitizedContent) {
            validatedData.bio = filterResult.sanitizedContent
        }
    }

    await prisma.person.update({
        where: { id },
        data: {
            name: validatedData.name,
            role: validatedData.role,
            fieldOfStudy: validatedData.fieldOfStudy,
            bio: validatedData.bio,
            linkedin: validatedData.linkedin,
            twitter: validatedData.twitter,
            website: validatedData.website
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

    // Validate ID format
    if (!/^[a-z0-9]+$/i.test(id)) {
        throw new Error("Invalid person ID")
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

    // Check if person is linked to a user (Public Profile)
    const personWithUser = await prisma.person.findUnique({
        where: { id },
        include: { linkedUser: true }
    })

    if (personWithUser?.linkedUser) {
        // Soft delete: Make profile private and remove from directory (unlink from institute/lab)
        await prisma.$transaction([
            prisma.user.update({
                where: { id: personWithUser.linkedUser.id },
                data: { isPublicProfile: false }
            }),
            prisma.person.update({
                where: { id },
                data: {
                    instituteId: null,
                    labId: null
                }
            })
        ])
    } else {
        // Hard delete for manual entries
        await prisma.person.delete({
            where: { id }
        })
    }

    return { success: true }
}
