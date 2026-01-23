import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import util from 'util';

const execPromise = util.promisify(exec);

// Helper to check admin permission
async function checkAdmin() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return false;

    // Strict check against env variable
    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail) return false; // Security: if env not set, no one is admin

    return session.user.email === adminEmail;
}

const BACKUP_DIR = process.env.BACKUP_DIR || '/backup';

export async function GET() {
    if (!await checkAdmin()) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    try {
        if (!fs.existsSync(BACKUP_DIR)) {
            fs.mkdirSync(BACKUP_DIR, { recursive: true });
        }

        const files = fs.readdirSync(BACKUP_DIR)
            .filter(file => file.endsWith('.sql') || file.endsWith('.sql.gz'))
            .map(file => {
                const filePath = path.join(BACKUP_DIR, file);
                const stats = fs.statSync(filePath);
                return {
                    name: file,
                    size: stats.size,
                    created: stats.birthtime,
                };
            })
            .sort((a, b) => b.created.getTime() - a.created.getTime());

        return NextResponse.json(files);
    } catch (error) {
        console.error('Backup list error:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}

export async function POST() {
    if (!await checkAdmin()) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    try {
        if (!fs.existsSync(BACKUP_DIR)) {
            fs.mkdirSync(BACKUP_DIR, { recursive: true });
        }

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `backup-${timestamp}.sql`;
        const filepath = path.join(BACKUP_DIR, filename);

        // Construct pg_dump command
        const dbHost = process.env.POSTGRES_HOST || 'db';
        const dbUser = process.env.POSTGRES_USER || 'cofactor';
        const dbName = process.env.POSTGRES_DB || 'cofactor_db';
        const dbPassword = process.env.POSTGRES_PASSWORD;

        // Command assumes pg_dump is available (installed via apk add postgresql-client)
        // We pass PGPASSWORD via env
        const env = { ...process.env, PGPASSWORD: dbPassword };
        const command = `pg_dump -h ${dbHost} -U ${dbUser} -d ${dbName} -f "${filepath}"`;

        console.log('Starting backup:', command);
        await execPromise(command, { env });

        // Optional: Compress
        await execPromise(`gzip "${filepath}"`);
        const finalFilename = `${filename}.gz`;

        return NextResponse.json({ success: true, filename: finalFilename });
    } catch (error) {
        console.error('Backup create error:', error);
        return new NextResponse('Failed to create backup: ' + (error instanceof Error ? error.message : String(error)), { status: 500 });
    }
}
