import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import fs from 'fs';
import path from 'path';

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

export async function GET(
    request: Request,
    { params }: { params: Promise<{ filename: string }> }
) {
    if (!await checkAdmin()) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    const { filename } = await params;

    // Security check: prevent directory traversal
    const safeFilename = path.basename(filename);
    const filepath = path.join(BACKUP_DIR, safeFilename);

    if (!fs.existsSync(filepath)) {
        return new NextResponse('File not found', { status: 404 });
    }

    try {
        const stats = fs.statSync(filepath);
        const fileStream = fs.createReadStream(filepath);

        // @ts-expect-error NextResponse supports streams but types are mismatched in this version
        return new NextResponse(fileStream, {
            headers: {
                'Content-Disposition': `attachment; filename="${safeFilename}"`,
                'Content-Type': 'application/octet-stream',
                'Content-Length': stats.size.toString(),
            },
        });
    } catch (error) {
        console.error('Download error:', error);
        return new NextResponse('Download failed', { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ filename: string }> }
) {
    if (!await checkAdmin()) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    const { filename } = await params;

    // Security check: prevent directory traversal
    const safeFilename = path.basename(filename);
    const filepath = path.join(BACKUP_DIR, safeFilename);

    if (!fs.existsSync(filepath)) {
        return new NextResponse('File not found', { status: 404 });
    }

    try {
        fs.unlinkSync(filepath);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete error:', error);
        return new NextResponse('Delete failed', { status: 500 });
    }
}
