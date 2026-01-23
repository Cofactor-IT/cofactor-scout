import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import util from 'util';

const execPromise = util.promisify(exec);

// Helper to check admin permission
async function checkAdmin() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return false;
    const adminEmail = process.env.ADMIN_EMAIL;
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
        const dbPassword = process.env.POSTGRES_PASSWORD; // needed for psql if not in .pgpass or env

        // Prepare command
        // If it's gzipped, we need to gunzip and pipe to psql
        // If it's plain sql, just psql -f

        let command;
        const isGzipped = safeFilename.endsWith('.gz');

        // We set PGPASSWORD env var for the command
        const env = { ...process.env, PGPASSWORD: dbPassword };

        if (isGzipped) {
            command = `gunzip -c "${filepath}" | psql -h ${dbHost} -U ${dbUser} -d ${dbName}`;
        } else {
            command = `psql -h ${dbHost} -U ${dbUser} -d ${dbName} -f "${filepath}"`;
        }

        // WARNING: Restoring overlaps existing data. Usually existing tables might need cleaning or 
        // the backup should have DROP TABLE statements. pg_dump by default does not include DROP TABLE unless requested.
        // However, for a simple restore, we might want to ensure a clean slate or rely on the backup being a complete snapshot (using --clean in dump would help).
        // The current dump script in scripts/backup.sh does `pg_dump ... > file`. It does not use --clean or --if-exists.
        // This means usually we should probably drop the DB and recreate it, or use --clean if we modify the backup script.
        // Since we can't easily modify the dump format of *existing* backups, we might rely on psql to just error on conflicts or mix data (bad).
        // BETTER: Let's assume for now we just run it. 
        // Ideally, we should drop public schema and recreate it.

        // Workaround: We will run a command to drop schema public cascade; create schema public; before restore.
        // This ensures clean state.
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
