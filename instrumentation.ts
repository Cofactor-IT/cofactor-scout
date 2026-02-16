export async function register() {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        const { prisma } = await import('@/lib/database/prisma')
        const adminEmail = process.env.ADMIN_EMAIL
        const adminPassword = process.env.ADMIN_PASSWORD

        if (!adminEmail || !adminPassword) {
            console.warn('ADMIN_EMAIL and ADMIN_PASSWORD not set - skipping initial admin setup')
            return
        }

        try {
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
        } catch (error: any) {
            if (error.code === 'P2021') {
                console.log('Database tables not yet created. Admin user will be created after migrations run.')
                return
            }
            console.error('Failed to create admin user:', error)
        }
    }

    if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
        await import('./instrumentation/sentry')
    }
}

