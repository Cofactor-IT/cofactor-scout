'use server'

import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import bcrypt from 'bcryptjs'

export async function signUp(prevState: any, formData: FormData) {
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const name = formData.get('name') as string
    const referralCode = formData.get('referralCode') as string

    // Validations
    if (!email || !password || !name || !referralCode) {
        return { error: 'All fields are required' }
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
        where: { email }
    })
    if (existingUser) {
        return { error: 'Email already exists' }
    }

    // Role Logic
    let role: 'STUDENT' | 'PENDING_STAFF' = 'STUDENT'
    let referrerId: string | null = null

    const STAFF_SECRET = process.env.STAFF_SECRET_CODE

    if (STAFF_SECRET && referralCode === STAFF_SECRET) {
        role = 'PENDING_STAFF'
    } else {
        // Must be a valid referrer code
        const referrer = await prisma.user.findUnique({
            where: { referralCode }
        })

        if (!referrer) {
            return { error: 'Invalid referral code' }
        }
        referrerId = referrer.id
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    // Generate own referral code (simple mock logic)
    // In prod, ensure uniqueness
    const newReferralCode = name.substring(0, 3).toUpperCase() + Math.floor(Math.random() * 10000).toString()

    try {
        const newUser = await prisma.user.create({
            data: {
                email,
                name,
                password: hashedPassword,
                role,
                referralCode: newReferralCode,
                referredBy: referrerId ? {
                    create: {
                        referrerId: referrerId
                    }
                } : undefined
            }
        })

        // Referral record created via nested write, so we don't need manual create.

        if (referrerId) {
            // Check if nested create worked? Yes it should.
            // Just increment referrer power score (+50)
            await prisma.user.update({
                where: { id: referrerId },
                data: { powerScore: { increment: 50 } }
            })
        }

    } catch (e) {
        console.error(e)
        return { error: 'Registration failed' }
    }

    redirect('/api/auth/signin') // Redirect to login
}
