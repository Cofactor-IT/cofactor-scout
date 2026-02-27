/**
 * Application Instrumentation
 * 
 * Initializes admin user on first run and sets up Sentry monitoring.
 * Runs during Next.js application startup.
 */
export async function register() {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        const { prisma } = await import('@/lib/database/prisma')
        const adminEmail = process.env.ADMIN_EMAIL
        const adminPassword = process.env.ADMIN_PASSWORD

        // Check if admin credentials are configured
        if (!adminEmail || !adminPassword) {
            console.warn('ADMIN_EMAIL and ADMIN_PASSWORD not set - skipping initial admin setup')
            return
        }

        try {
            const existingAdmin = await prisma.user.findUnique({
                where: { email: adminEmail }
            })

            // Create admin user if doesn't exist
            if (!existingAdmin) {
                const bcrypt = await import('bcryptjs')
                const hashedPassword = await bcrypt.hash(adminPassword, 10)

                await prisma.user.create({
                    data: {
                        email: adminEmail,
                        password: hashedPassword,
                        fullName: 'System Admin',
                        firstName: 'System',
                        lastName: 'Admin',
                        role: 'ADMIN'
                    }
                })
                console.log('Admin user created successfully')
            }
        } catch (error: any) {
            // Handle case where database tables don't exist yet
            if (error.code === 'P2021') {
                console.log('Database tables not yet created. Admin user will be created after migrations run.')
                return
            }
            console.error('Failed to create admin user:', error)
        }
    }

    // Initialize Sentry if configured
    if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
        await import('./instrumentation/sentry')
    }
}

