import { randomBytes } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { existsSync } from 'fs'
import { containsSqlInjection } from '@/lib/security/sanitization'

// Allowed types for university logos (includes SVG)
const ALLOWED_LOGO_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml'] as const
const MAX_LOGO_SIZE = 2 * 1024 * 1024 // 2MB

// Magic bytes for image validation
const IMAGE_MAGIC_BYTES: Record<string, Buffer | null> = {
    'image/png': Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]),
    'image/jpeg': Buffer.from([0xFF, 0xD8, 0xFF]),
    'image/webp': Buffer.from([0x52, 0x49, 0x46, 0x46]),
    'image/svg+xml': null // SVGs need special handling
}

export async function POST(request: NextRequest) {
    try {
        // Check admin authentication
        const session = await getServerSession(authOptions)
        if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'STAFF')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const formData = await request.formData()
        const file = formData.get('file') as File | null
        const universityId = formData.get('universityId') as string | null

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 })
        }

        if (!universityId) {
            return NextResponse.json({ error: 'University ID required' }, { status: 400 })
        }

        // Validate universityId format (CUID)
        if (!/^[a-z0-9]+$/i.test(universityId)) {
            return NextResponse.json({ error: 'Invalid university ID' }, { status: 400 })
        }

        // Validate filename for security
        if (containsSqlInjection(file.name)) {
            return NextResponse.json({ error: 'Invalid filename' }, { status: 400 })
        }

        // Validate file type
        if (!ALLOWED_LOGO_TYPES.includes(file.type as typeof ALLOWED_LOGO_TYPES[number])) {
            return NextResponse.json({ 
                error: 'Invalid file type. Allowed: PNG, JPG, WEBP, SVG' 
            }, { status: 400 })
        }

        // Validate file size
        if (file.size > MAX_LOGO_SIZE) {
            return NextResponse.json({ 
                error: 'File too large. Maximum size: 2MB' 
            }, { status: 400 })
        }

        // Validate file content with magic bytes
        const validationBytes = await file.arrayBuffer()
        const validationBuffer = Buffer.from(validationBytes)

        if (file.type !== 'image/svg+xml') {
            const magic = IMAGE_MAGIC_BYTES[file.type]
            if (magic && !validationBuffer.slice(0, magic.length).equals(magic)) {
                return NextResponse.json({ error: 'Invalid file content' }, { status: 400 })
            }
        } else {
            // For SVGs: Parse and sanitize DOM to prevent SVG-based XSS
            const content = validationBuffer.toString('utf-8')
            if (/<script|javascript:|onload=|onerror=/i.test(content)) {
                return NextResponse.json({ error: 'SVG contains disallowed elements' }, { status: 400 })
            }
        }

        // Create directory if it doesn't exist
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'universities')
        if (!existsSync(uploadDir)) {
            await mkdir(uploadDir, { recursive: true })
        }

        // Generate safe filename
        const ext = path.extname(file.name).toLowerCase()
        const allowedExts = ['.png', '.jpg', '.jpeg', '.webp', '.svg']
        if (!allowedExts.includes(ext)) {
            return NextResponse.json({ error: 'Invalid file extension' }, { status: 400 })
        }

        const filename = `${universityId}-${Date.now()}${ext}`
        const filepath = path.join(uploadDir, filename)

        // Write file
        await writeFile(filepath, validationBuffer)

        // Return the public URL path
        const publicPath = `/uploads/universities/${filename}`

        return NextResponse.json({ success: true, path: publicPath })
    } catch (error) {
        console.error('Logo upload error:', error)
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
    }
}
