import { Database, HardDrive, Clock } from 'lucide-react';

interface BackupStatsProps {
    totalBackups: number;
    lastBackupDate: Date | null;
    totalSize: number;
}

export function BackupStats({ totalBackups, lastBackupDate, totalSize }: BackupStatsProps) {
    // Format bytes to readable size
    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border bg-card text-card-foreground shadow">
                <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
                    <h3 className="tracking-tight text-sm font-medium">Total Backups</h3>
                    <Database className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="p-6 pt-0">
                    <div className="text-2xl font-bold">{totalBackups}</div>
                    <p className="text-xs text-muted-foreground">Stored in system</p>
                </div>
            </div>
            <div className="rounded-xl border bg-card text-card-foreground shadow">
                <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
                    <h3 className="tracking-tight text-sm font-medium">Total Size</h3>
                    <HardDrive className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="p-6 pt-0">
                    <div className="text-2xl font-bold">{formatSize(totalSize)}</div>
                    <p className="text-xs text-muted-foreground">Disk usage</p>
                </div>
            </div>
            <div className="rounded-xl border bg-card text-card-foreground shadow">
                <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
                    <h3 className="tracking-tight text-sm font-medium">Last Backup</h3>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="p-6 pt-0">
                    <div className="text-2xl font-bold">
                        {lastBackupDate ? lastBackupDate.toLocaleDateString() : 'Never'}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        {lastBackupDate ? lastBackupDate.toLocaleTimeString() : 'No backups yet'}
                    </p>
                </div>
            </div>
        </div>
    );
}
