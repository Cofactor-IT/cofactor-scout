import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';

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

// Strict filename validation to prevent injection attacks
function isValidFilename(filename: string): boolean {
    // Only allow alphanumeric, dashes, underscores, and dots
    // Must end with .sql or .sql.gz
    if (!/^[a-zA-Z0-9_\-\.]+$/.test(filename)) {
        return false;
    }
    if (!filename.endsWith('.sql') && !filename.endsWith('.sql.gz')) {
        return false;
    }
    return true;
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
                reject(new Error(`Command failed with code ${code}`));
            }
        });

        proc.on('error', (err) => {
            reject(err);
        });
    });
}

// Execute piped commands safely (gunzip | psql)
function execPipedCommand(
    cmd1: string, args1: string[],
    cmd2: string, args2: string[],
    env: NodeJS.ProcessEnv
): Promise<void> {
    return new Promise((resolve, reject) => {
        const proc1 = spawn(cmd1, args1, { env });
        const proc2 = spawn(cmd2, args2, { env, stdio: ['pipe', 'inherit', 'inherit'] });

        proc1.stdout.pipe(proc2.stdin);

        proc1.on('error', reject);
        proc2.on('error', reject);

        proc2.on('close', (code) => {
            if (code === 0) {
                resolve();
            } else {
                reject(new Error(`Restore command failed with code ${code}`));
            }
        });
    });
}

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

        // Strict filename validation
        if (!isValidFilename(safeFilename)) {
            return new NextResponse('Invalid filename', { status: 400 });
        }

        const filepath = path.join(BACKUP_DIR, safeFilename);

        if (!fs.existsSync(filepath)) {
            return new NextResponse('Backup file not found', { status: 404 });
        }

        // Database connection details
        const dbHost = process.env.POSTGRES_HOST || 'db';
        const dbUser = process.env.POSTGRES_USER || 'cofactor';
        const dbName = process.env.POSTGRES_DB || 'cofactor_db';
        const dbPassword = process.env.POSTGRES_PASSWORD;

        const isGzipped = safeFilename.endsWith('.gz');
        const env = { ...process.env, PGPASSWORD: dbPassword };

        // Clean database first: drop and recreate public schema
        console.log('Cleaning database...');
        await execCommand('psql', [
            '-h', dbHost,
            '-U', dbUser,
            '-d', dbName,
            '-c', 'DROP SCHEMA public CASCADE; CREATE SCHEMA public;'
        ], env);

        console.log('Restoring backup:', safeFilename);

        if (isGzipped) {
            // Pipe gunzip output to psql
            await execPipedCommand(
                'gunzip', ['-c', filepath],
                'psql', ['-h', dbHost, '-U', dbUser, '-d', dbName],
                env
            );
        } else {
            // Direct restore from SQL file
            await execCommand('psql', [
                '-h', dbHost,
                '-U', dbUser,
                '-d', dbName,
                '-f', filepath
            ], env);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Restore error:', error);
        // Return generic error message to prevent information disclosure
        return new NextResponse('Restore failed', { status: 500 });
    }
}
