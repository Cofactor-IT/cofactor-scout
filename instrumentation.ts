import { prisma } from '@/lib/prisma'

export async function register() {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        const adminEmail = process.env.ADMIN_EMAIL
        const adminPassword = process.env.ADMIN_PASSWORD

        // Require both environment variables to be set
        if (!adminEmail || !adminPassword) {
            throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD environment variables must be set for initial admin setup')
        }

        // Check if admin already exists
        const existingAdmin = await prisma.user.findUnique({
            where: { email: adminEmail }
        })

        if (!existingAdmin) {
            try {
                const bcrypt = await import('bcryptjs')
                const hashedPassword = await bcrypt.hash(adminPassword, 10)

                await prisma.user.create({
                    data: {
                        email: adminEmail,
                        password: hashedPassword,
                        name: 'System Admin',
                        role: 'ADMIN',
                        referralCode: 'ADMIN_MASTER',
                        powerScore: 9999
                    }
                })
            } catch (error) {
                console.error('Failed to create admin user:', error)
                throw error
            }
        }
    }
}
