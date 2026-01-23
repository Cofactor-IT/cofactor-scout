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
    if (!adminEmail) return false;

    return session.user.email === adminEmail;
}

const BACKUP_DIR = process.env.BACKUP_DIR || '/backup';

export async function POST(request: Request) {
    if (!await checkAdmin()) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    try {
        const { filename } = await request.json();

        if (!filename) {
            return new NextResponse('Filename is required', { status: 400 });
        }

        const safeFilename = path.basename(filename);
        const filepath = path.join(BACKUP_DIR, safeFilename);

        if (!fs.existsSync(filepath)) {
            return new NextResponse('Backup file not found', { status: 404 });
        }

        // Database connection details
        const dbHost = process.env.POSTGRES_HOST || 'db';
        const dbUser = process.env.POSTGRES_USER || 'cofactor';
        const dbName = process.env.POSTGRES_DB || 'cofactor';
        const dbPassword = process.env.POSTGRES_PASSWORD;

        let command;
        const isGzipped = safeFilename.endsWith('.gz');

        // We set PGPASSWORD env var for the command
        const env = { ...process.env, PGPASSWORD: dbPassword };

        if (isGzipped) {
            command = `gunzip -c "${filepath}" | psql -h ${dbHost} -U ${dbUser} -d ${dbName}`;
        } else {
            command = `psql -h ${dbHost} -U ${dbUser} -d ${dbName} -f "${filepath}"`;
        }

        // Workaround for clean restore: drop public schema and recreate
        const cleanCommand = `psql -h ${dbHost} -U ${dbUser} -d ${dbName} -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"`;

        console.log('Cleaning database...');
        await execPromise(cleanCommand, { env });

        console.log('Restoring backup:', command);
        await execPromise(command, { env });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Restore error:', error);
        return new NextResponse('Restore failed: ' + (error instanceof Error ? error.message : String(error)), { status: 500 });
    }
}
