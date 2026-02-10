import { randomBytes } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { existsSync } from 'fs'
import { wikiImageUploadSchema } from '@/lib/validation'
import { 
    validateFileMagicBytes, 
    ALLOWED_IMAGE_TYPES,
    MAX_FILE_SIZE,
    containsSqlInjection 
} from '@/lib/sanitization'

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const formData = await request.formData()
        const file = formData.get('file') as File | null

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 })
        }

        // Validate filename for security
        if (containsSqlInjection(file.name)) {
            return NextResponse.json({ error: 'Invalid filename' }, { status: 400 })
        }

        // Validate file metadata using Zod schema
        const fileValidation = wikiImageUploadSchema.safeParse({
            name: file.name,
            type: file.type,
            size: file.size
        })

        if (!fileValidation.success) {
            const errorMessage = fileValidation.error.issues.map((issue: { message: string }) => issue.message).join(', ')
            return NextResponse.json({ error: errorMessage }, { status: 400 })
        }

        // Validate file content with magic bytes
        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        
        const magicValidation = validateFileMagicBytes(buffer, file.type)
        if (!magicValidation.isValid) {
            return NextResponse.json({ error: magicValidation.error }, { status: 400 })
        }

        // Create directory if it doesn't exist
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'wiki')
        if (!existsSync(uploadDir)) {
            await mkdir(uploadDir, { recursive: true })
        }

        // Generate safe filename
        const ext = path.extname(file.name).toLowerCase()
        const allowedExts = ['.jpg', '.jpeg', '.png', '.webp']
        if (!allowedExts.includes(ext)) {
            return NextResponse.json({ error: 'Invalid file extension' }, { status: 400 })
        }

        const randomSuffix = randomBytes(8).toString('hex')
        const filename = `${session.user.id}-${randomSuffix}${ext}`
        const filepath = path.join(uploadDir, filename)

        // Write file
        await writeFile(filepath, buffer)

        const publicPath = `/uploads/wiki/${filename}`

        return NextResponse.json({ success: true, url: publicPath })
    } catch (error) {
        console.error('Wiki image upload error:', error)
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
    }
}
