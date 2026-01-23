'use client';

import { useState } from 'react';
import { Download, Trash2, RotateCcw, FileUp, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';

interface BackupFile {
    name: string;
    size: number;
    created: string; // Date string from API
}

interface BackupListProps {
    backups: BackupFile[];
    onRefresh: () => void;
}

export function BackupList({ backups, onRefresh }: BackupListProps) {
    const [isCreating, setIsCreating] = useState(false);
    const [isRestoring, setIsRestoring] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadFile, setUploadFile] = useState<File | null>(null);

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const handleCreateBackup = async () => {
        setIsCreating(true);
        try {
            const res = await fetch('/api/admin/backups', { method: 'POST' });
            if (!res.ok) throw new Error('Failed to create backup');
            onRefresh();
        } catch (error) {
            console.error(error);
            alert('Failed to create backup');
        } finally {
            setIsCreating(false);
        }
    };

    const handleDelete = async (filename: string) => {
        if (!confirm('Are you sure you want to delete this backup?')) return;
        try {
            const res = await fetch(`/api/admin/backups/${filename}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to delete');
            onRefresh();
        } catch (error) {
            console.error(error);
            alert('Failed to delete backup');
        }
    };

    const handleDownload = (filename: string) => {
        window.location.href = `/api/admin/backups/${filename}`;
    };

    const handleRestore = async (filename: string) => {
        if (!confirm(`Are you absolutely sure you want to restore ${filename}? This will overwrite the current database. This action CANNOT be undone.`)) return;

        setIsRestoring(true);
        try {
            const res = await fetch('/api/admin/backups/restore', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ filename }),
            });
            if (!res.ok) throw new Error('Failed to restore');
            alert('Database restored successfully! You will need to re-login.');
            window.location.href = '/api/auth/signout';
        } catch (error) {
            console.error(error);
            alert('Failed to restore database. Check server logs.');
        } finally {
            setIsRestoring(false);
        }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!uploadFile) return;

        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', uploadFile);

            const res = await fetch('/api/admin/backups/upload', {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) throw new Error('Upload failed');

            setUploadFile(null);
            // Reset file input if possible
            const fileInput = document.getElementById('file-upload') as HTMLInputElement;
            if (fileInput) fileInput.value = '';

            onRefresh();
            alert('Backup uploaded successfully');
        } catch (error) {
            console.error(error);
            alert('Failed to upload backup');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold tracking-tight">Available Backups</h2>
                <div className="flex gap-2">
                    <div className="flex items-center gap-2">
                        <form onSubmit={handleUpload} className="flex items-center gap-2">
                            <Input
                                id="file-upload"
                                type="file"
                                accept=".sql,.gz"
                                onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                                className="w-full max-w-xs"
                            />
                            <Button type="submit" variant="outline" disabled={!uploadFile || isUploading}>
                                {isUploading ? 'Uploading...' : <><FileUp className="mr-2 h-4 w-4" /> Upload</>}
                            </Button>
                        </form>
                    </div>
                    <Button onClick={handleCreateBackup} disabled={isCreating}>
                        {isCreating ? 'Creating...' : <><Plus className="mr-2 h-4 w-4" /> Create Backup</>}
                    </Button>
                </div>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Filename</TableHead>
                            <TableHead>Size</TableHead>
                            <TableHead>Created</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {backups.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">
                                    No backups found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            backups.map((backup) => (
                                <TableRow key={backup.name}>
                                    <TableCell className="font-medium">{backup.name}</TableCell>
                                    <TableCell>{formatSize(backup.size)}</TableCell>
                                    <TableCell>{new Date(backup.created).toLocaleString()}</TableCell>
                                    <TableCell className="text-right flex justify-end gap-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDownload(backup.name)}
                                            title="Download"
                                        >
                                            <Download className="h-4 w-4" />
                                        </Button>

                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            title="Restore"
                                            className="text-orange-500 hover:text-orange-600"
                                            onClick={() => handleRestore(backup.name)}
                                        >
                                            <RotateCcw className="h-4 w-4" />
                                        </Button>

                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDelete(backup.name)}
                                            title="Delete"
                                            className="text-red-500 hover:text-red-600 hover:bg-red-100"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
