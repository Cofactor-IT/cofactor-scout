import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';

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

// Validate filename to prevent injection attacks
function isValidFilename(filename: string): boolean {
    // Only allow alphanumeric, dashes, underscores, and dots
    return /^[a-zA-Z0-9_\-\.]+$/.test(filename);
}

// Execute command using spawn with argument array (prevents command injection)
function execCommand(command: string, args: string[], env: NodeJS.ProcessEnv): Promise<{ stdout: string; stderr: string }> {
    return new Promise((resolve, reject) => {
        const proc = spawn(command, args, { env });
        let stdout = '';
        let stderr = '';

        proc.stdout.on('data', (data) => { stdout += data.toString(); });
        proc.stderr.on('data', (data) => { stderr += data.toString(); });

        proc.on('close', (code) => {
            if (code === 0) {
                resolve({ stdout, stderr });
            } else {
                reject(new Error(`Command failed with code ${code}: ${stderr}`));
            }
        });

        proc.on('error', (err) => {
            reject(err);
        });
    });
}

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

        // Validate generated filename
        if (!isValidFilename(filename)) {
            return new NextResponse('Invalid filename generated', { status: 500 });
        }

        const filepath = path.join(BACKUP_DIR, filename);

        // Database connection details
        const dbHost = process.env.POSTGRES_HOST || 'db';
        const dbUser = process.env.POSTGRES_USER || 'cofactor';
        const dbName = process.env.POSTGRES_DB || 'cofactor_db';
        const dbPassword = process.env.POSTGRES_PASSWORD;

        // Use spawn with argument array to prevent command injection
        const env = { ...process.env, PGPASSWORD: dbPassword };

        console.log('Starting backup to:', filename);

        // Execute pg_dump with argument array
        await execCommand('pg_dump', ['-h', dbHost, '-U', dbUser, '-d', dbName, '-f', filepath], env);

        // Compress the backup
        await execCommand('gzip', [filepath], env);
        const finalFilename = `${filename}.gz`;

        return NextResponse.json({ success: true, filename: finalFilename });
    } catch (error) {
        console.error('Backup create error:', error);
        // Return generic error message to prevent information disclosure
        return new NextResponse('Failed to create backup', { status: 500 });
    }
}
