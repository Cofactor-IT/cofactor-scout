import { DefaultSession } from "next-auth"

declare module 'next-auth' {
    interface User {
        id: string
        role: string
        universityId?: string | null
        secondaryUniversityId?: string | null
    }

    interface Session {
        user: {
            id: string
            role: string
            universityId?: string | null
            secondaryUniversityId?: string | null
        } & DefaultSession["user"]
    }
}
