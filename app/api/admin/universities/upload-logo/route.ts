import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { existsSync } from 'fs'

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

        // Validate file type
        const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml']
        if (!validTypes.includes(file.type)) {
            return NextResponse.json({ error: 'Invalid file type. Allowed: PNG, JPG, WEBP, SVG' }, { status: 400 })
        }

        // Validate file size (max 2MB)
        const maxSize = 2 * 1024 * 1024
        if (file.size > maxSize) {
            return NextResponse.json({ error: 'File too large. Maximum size: 2MB' }, { status: 400 })
        }

        // Create directory if it doesn't exist
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'universities')
        if (!existsSync(uploadDir)) {
            await mkdir(uploadDir, { recursive: true })
        }

        // Generate unique filename
        const ext = path.extname(file.name) || '.png'
        const filename = `${universityId}-${Date.now()}${ext}`
        const filepath = path.join(uploadDir, filename)

        // Convert file to buffer and save
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        await writeFile(filepath, buffer)

        // Return the public URL path
        const publicPath = `/uploads/universities/${filename}`

        return NextResponse.json({ success: true, path: publicPath })
    } catch (error) {
        console.error('Logo upload error:', error)
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
    }
}
