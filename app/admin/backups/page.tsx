'use client';

import { useState, useEffect, useCallback } from 'react';
import { BackupList } from '@/components/admin/BackupList';
import { BackupStats } from '@/components/admin/BackupStats';
import { Button } from '@/components/ui/button';
import { RefreshCcw } from 'lucide-react';

interface BackupFile {
    name: string;
    size: number;
    created: string;
}

export default function BackupsPage() {
    const [backups, setBackups] = useState<BackupFile[]>([]);
    const fetchBackups = useCallback(async () => {
        try {
            const res = await fetch('/api/admin/backups');
            if (res.ok) {
                const data = await res.json();
                setBackups(data);
            }
        } catch (error) {
            console.error('Failed to fetch backups', error);
        }
    }, []);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchBackups();
    }, [fetchBackups]);

    const totalSize = backups.reduce((acc, curr) => acc + curr.size, 0);
    const lastBackup = backups.length > 0 ? new Date(backups[0].created) : null;

    return (
        <div className="container mx-auto py-10 space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Backups & Restore</h1>
                <Button variant="outline" size="sm" onClick={fetchBackups}>
                    <RefreshCcw className="mr-2 h-4 w-4" /> Refresh
                </Button>
            </div>

            <BackupStats
                totalBackups={backups.length}
                lastBackupDate={lastBackup}
                totalSize={totalSize}
            />

            <BackupList
                backups={backups}
                onRefresh={fetchBackups}
            />
        </div>
    );
}
