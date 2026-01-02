
import { prisma } from '@/lib/prisma'

export async function register() {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@cofactor.world'
        const adminPassword = process.env.ADMIN_PASSWORD || 'your_secure_password_here'

        // Check if ANY admin exists to avoid re-seeding repeatedly on every restart if not needed
        // Or specific admin? Let's check specific admin by email.
        const existingAdmin = await prisma.user.findUnique({
            where: { email: adminEmail }
        })

        if (!existingAdmin) {
            console.log(`Creating initial admin user: ${adminEmail}`)
            // In a real app we would hash this password. 
            // For now, we will store it as is, or leverage the bcrypt we installed.
            // Since we are inside instrumentation, we can import bcryptjs.

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
                console.log('Admin user created successfully.')
            } catch (error) {
                console.error('Failed to create admin user:', error)
            }
        }
    }
}
