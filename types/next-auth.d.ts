import { DefaultSession } from "next-auth"
import { Role } from "@prisma/client"

declare module 'next-auth' {
    interface User {
        id: string
        role: Role
        emailVerified: Date | null
        rememberMe?: boolean
    }

    interface Session {
        user: {
            id: string
            role: Role
            emailVerified: Date | null
        } & DefaultSession["user"]
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        id: string
        role: Role
        rememberMe?: boolean
    }
}
