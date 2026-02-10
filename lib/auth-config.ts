import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import { logger } from "@/lib/logger"

// Account lockout configuration
const MAX_LOGIN_ATTEMPTS = 5
const LOCKOUT_DURATION_MINUTES = 15

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email }
                })

                // User not found - return null
                if (!user) {
                    return null
                }

                if (user.password === null) {
                    return null
                }

                // Check if account is locked
                if (user.lockedUntil && user.lockedUntil > new Date()) {
                    logger.warn('Login attempt on locked account', { email: user.email })
                    return null
                }

                // Check email verification BEFORE password check to prevent timing attacks
                // and account enumeration
                if (!user.emailVerified && user.email !== process.env.ADMIN_EMAIL) {
                    logger.warn('Login attempt with unverified email', { email: user.email })
                    return null
                }

                const bcrypt = await import('bcryptjs')
                const isValid = await bcrypt.compare(credentials.password, user.password)

                if (!isValid) {
                    // Increment failed login attempts
                    const attempts = (user.failedLoginAttempts || 0) + 1
                    const updateData: { failedLoginAttempts: number; lockedUntil?: Date } = {
                        failedLoginAttempts: attempts
                    }

                    // Lock account if max attempts reached
                    if (attempts >= MAX_LOGIN_ATTEMPTS) {
                        updateData.lockedUntil = new Date(Date.now() + LOCKOUT_DURATION_MINUTES * 60 * 1000)
                        logger.warn('Account locked due to too many failed attempts', { email: user.email, attempts })
                    }

                    await prisma.user.update({
                        where: { id: user.id },
                        data: updateData
                    })

                    return null
                }

                // Successful login - reset failed attempts
                if (user.failedLoginAttempts && user.failedLoginAttempts > 0) {
                    await prisma.user.update({
                        where: { id: user.id },
                        data: {
                            failedLoginAttempts: 0,
                            lockedUntil: null
                        }
                    })
                }

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    universityId: user.universityId,
                    secondaryUniversityId: user.secondaryUniversityId
                }
            }
        })
    ],
    callbacks: {
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string
                session.user.role = token.role as string
                session.user.universityId = token.universityId as string | undefined
                session.user.secondaryUniversityId = token.secondaryUniversityId as string | undefined
                const { setSentryUser } = await import('@/instrumentation/sentry')
                setSentryUser(token.id as string, session.user.email || '', token.role as string)
            }
            return session
        },
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id
                token.role = (user as { id: string; role?: string }).role
                token.universityId = (user as { universityId?: string }).universityId
                token.secondaryUniversityId = (user as { secondaryUniversityId?: string }).secondaryUniversityId
            }
            return token
        },
        // Redirect to sign-up page if user doesn't exist
        async signIn({ user, account }) {
            // user is defined only when sign in is successful
            // If we get here with credentials provider but no user, redirect to signup
            // Fix: Operator precedence issue (!user && account...)
            if (!user && (account?.provider === 'credentials')) {
                return Promise.resolve(false) // This will cause an error
            }
            return Promise.resolve(true)
        }
    },
    pages: {
        signIn: '/auth/signin',
        newUser: '/auth/signup'
    },
    session: {
        strategy: "jwt",
        maxAge: 7 * 24 * 60 * 60, // 7 days (reduced from 30 for better security)
    },
    secret: process.env.NEXTAUTH_SECRET
}
