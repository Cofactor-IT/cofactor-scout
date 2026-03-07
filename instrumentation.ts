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
        } catch (error: unknown) {
            const errorCode = typeof error === 'object' && error !== null && 'code' in error
                ? String((error as { code: unknown }).code)
                : undefined

            // Handle case where database schema is not yet applied
            if (errorCode === 'P2021' || errorCode === 'P2022') {
                console.log('Database schema is behind code. Run Prisma migrations, then restart the app.')
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

