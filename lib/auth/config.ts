/**
 * config.ts
 * 
 * NextAuth.js configuration for authentication.
 * Implements credentials-based auth with email verification,
 * account lockout after failed attempts, and remember me functionality.
 * 
 * Security features:
 * - Account locks after 5 failed login attempts for 15 minutes
 * - Email verification required before login
 * - Failed attempts reset on successful login
 * - JWT sessions with configurable expiration
 */

import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/database/prisma"
import { logger } from "@/lib/logger"
import { Role } from "@prisma/client"

// ============================================
// CONSTANTS
// ============================================

// Account locks after this many consecutive failed login attempts
const MAX_LOGIN_ATTEMPTS = 5
// Account remains locked for this duration after max attempts
const LOCKOUT_DURATION_MINUTES = 15

/**
 * NextAuth configuration object.
 * Defines authentication providers, callbacks, and session management.
 */
export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
                rememberMe: { label: "Remember Me", type: "text" }
            },
            /**
             * Validates user credentials and handles account lockout.
             * Returns user object on success, null on failure.
             * 
             * @param credentials - Email, password, and rememberMe flag
             * @returns User object or null
             */
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email }
                })

                // User not found - return null without revealing account existence
                if (!user) {
                    return null
                }

                if (user.password === null) {
                    return null
                }

                // Check if account is locked due to failed login attempts
                if (user.lockedUntil && user.lockedUntil > new Date()) {
                    logger.warn('Login attempt on locked account', { email: user.email })
                    return null
                }

                // Require email verification before allowing login
                // Admin email bypasses verification for initial setup
                if (!user.emailVerified && user.email !== process.env.ADMIN_EMAIL) {
                    logger.warn('Login attempt with unverified email', { email: user.email })
                    // Return null to show generic error message
                    return null
                }

                // Verify password with bcrypt
                const bcrypt = await import('bcryptjs')
                const isValid = await bcrypt.compare(credentials.password, user.password)

                if (!isValid) {
                    // Increment failed login attempts counter
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

                // Successful login - reset failed attempts and unlock account
                if (user.failedLoginAttempts && user.failedLoginAttempts > 0) {
                    await prisma.user.update({
                        where: { id: user.id },
                        data: {
                            failedLoginAttempts: 0,
                            lockedUntil: null
                        }
                    })
                }

                // Send sign-in notification email
                const { sendNewSignInEmail } = await import('@/lib/email/send')
                try {
                    const timestamp = new Date().toLocaleString('en-US', {
                        dateStyle: 'medium',
                        timeStyle: 'short'
                    })
                    await sendNewSignInEmail(user.email, user.fullName, timestamp)
                    logger.info('Sign-in notification sent', { email: user.email })
                } catch (err) {
                    logger.error('Failed to send sign-in notification', { email: user.email, error: err })
                }

                // Return user data for session
                return {
                    id: user.id,
                    email: user.email,
                    name: user.fullName,
                    role: user.role,
                    emailVerified: user.emailVerified,
                    rememberMe: credentials.rememberMe === 'true'
                }
            }
        })
    ],
    callbacks: {
        /**
         * Enriches session with user ID and role from JWT token.
         * Also sets Sentry user context for error tracking.
         */
        async session({ session, token }) {
            if (session.user) {
                // Add user ID and role to session for server-side access
                session.user.id = token.id as string
                session.user.role = token.role
                // Set Sentry user context for error tracking
                const { setSentryUser } = await import('@/instrumentation/sentry')
                setSentryUser(token.id as string, session.user.email || '', token.role as string)
            }
            return session
        },
        /**
         * Enriches JWT token with user data and sets expiration based on rememberMe.
         * Remember me: 30 days, otherwise: 1 day.
         */
        async jwt({ token, user, trigger }) {
            if (user) {
                token.id = user.id
                token.role = user.role
                token.rememberMe = user.rememberMe
                // Set token expiration: 30 days if remember me, 1 day otherwise
                const maxAge = user.rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24
                token.exp = Math.floor(Date.now() / 1000) + maxAge
            }
            return token
        },
        /**
         * Sign in callback to handle authentication failures.
         * Returns false if credentials are invalid.
         */
        async signIn({ user, account }) {
            // If credentials provider but no user, authentication failed
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
        // Default max age, overridden by JWT callback based on rememberMe
        maxAge: 60 * 60 * 24 * 30,
    },
    // Secret key for signing JWT tokens
    secret: process.env.NEXTAUTH_SECRET
}
