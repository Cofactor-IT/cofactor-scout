import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import fs from 'fs';
import path from 'path';
import { writeFile } from 'fs/promises';

// Helper to check admin permission
async function checkAdmin() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return false;

    // Strict check against env variable
    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail) return false;

    return session.user.email === adminEmail;
}

const BACKUP_DIR = process.env.BACKUP_DIR || '/backup';

// Validate filename to prevent injection attacks
function isValidFilename(filename: string): boolean {
    // Only allow alphanumeric, dashes, underscores, and dots
    return /^[a-zA-Z0-9_\-\.]+$/.test(filename);
}

export async function POST(request: Request) {
    if (!await checkAdmin()) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    try {
        const formData = await request.formData();
        const file = formData.get('file') as File | null;

        if (!file) {
            return new NextResponse('No file uploaded', { status: 400 });
        }

        // Validate file extension
        if (!file.name.endsWith('.sql') && !file.name.endsWith('.sql.gz')) {
            return new NextResponse('Invalid file format. Must be .sql or .sql.gz', { status: 400 });
        }

        const safeFilename = path.basename(file.name);

        // Validate filename characters
        if (!isValidFilename(safeFilename)) {
            return new NextResponse('Invalid filename. Only alphanumeric characters, dashes, underscores, and dots allowed.', { status: 400 });
        }

        if (!fs.existsSync(BACKUP_DIR)) {
            fs.mkdirSync(BACKUP_DIR, { recursive: true });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const filepath = path.join(BACKUP_DIR, safeFilename);

        await writeFile(filepath, buffer);

        return NextResponse.json({ success: true, filename: safeFilename });
    } catch (error) {
        console.error('Upload error:', error);
        return new NextResponse('Upload failed', { status: 500 });
    }
}
