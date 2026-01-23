import { NextResponse } from 'next/server'
import { extractEmailDomain, isPersonalEmail, findUniversityByDomain } from '@/lib/universityUtils'

// Prevent Next.js from caching this route - always fetch fresh data
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    const domain = searchParams.get('domain')

    const targetDomain = domain || (email ? extractEmailDomain(email) : null)

    if (!targetDomain) {
        return NextResponse.json({ error: 'Email or domain parameter required' }, { status: 400 })
    }

    // Check if it's a personal email
    const personalEmail = email ? isPersonalEmail(email) : false

    let university = null
    try {
        // Find university by domain using shared logic
        const foundUniversity = await findUniversityByDomain(targetDomain)

        if (foundUniversity) {
            // Return only public fields
            university = {
                id: foundUniversity.id,
                name: foundUniversity.name
            }
        }
    } catch (error) {
        console.error('Database error in university lookup:', error)
        // Fallback: DB might be down or table missing. 
        // We continue with null university so user can at least see "unknown domain" input.
    }

    return NextResponse.json({
        university: university || null,
        isPersonalEmail: personalEmail,
        domain: targetDomain
    })
}
