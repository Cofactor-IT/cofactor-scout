import { prisma } from '@/lib/prisma'

export async function register() {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        const adminEmail = process.env.ADMIN_EMAIL
        const adminPassword = process.env.ADMIN_PASSWORD

        // Skip if env vars not set - log warning but don't crash startup
        if (!adminEmail || !adminPassword) {
            console.warn('ADMIN_EMAIL and ADMIN_PASSWORD not set - skipping initial admin setup')
            return
        }

        try {
            // Check if admin already exists
            const existingAdmin = await prisma.user.findUnique({
                where: { email: adminEmail }
            })

            if (!existingAdmin) {
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
                console.log('Admin user created successfully')
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            // If tables don't exist yet (P2021), skip silently - migrations will run via entrypoint
            if (error.code === 'P2021') {
                console.log('Database tables not yet created. Admin user will be created after migrations run.')
                return
            }
            console.error('Failed to create admin user:', error)
        }
    }
}
