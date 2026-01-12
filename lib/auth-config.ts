import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"

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

                // User not found - return null with a specific indicator
                if (!user) {
                    return null
                }

                if (user.password === null) {
                    return null
                }

                const bcrypt = await import('bcryptjs')
                const isValid = await bcrypt.compare(credentials.password, user.password)

                if (!isValid) return null

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role
                }
            }
        })
    ],
    callbacks: {
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string
                session.user.role = token.role as string // Custom role property
            }
            return session
        },
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id
                token.role = (user as { id: string; role?: string }).role
            }
            return token
        },
        // Redirect to sign-up page if user doesn't exist
        async signIn({ user, account }) {
            // user is defined only when sign in is successful
            // If we get here with credentials provider but no user, redirect to signup
            if (!user && account?.provider === 'credentials') {
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
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    secret: process.env.NEXTAUTH_SECRET
}
