'use client';

import { FileIcon, Download, Variable, FileText, Image as ImageIcon, PlayCircle, Film } from 'lucide-react';
import Image from 'next/image';

interface FileAttachmentBubbleProps {
    url: string;
    name: string;
    type: string;
    size?: number;
}

export default function FileAttachmentBubble({ url, name, type, size }: FileAttachmentBubbleProps) {
    const isImage = type.startsWith('image/');
    const isVideo = type.startsWith('video/');

    // Format bytes to KB/MB
    const formatSize = (bytes?: number) => {
        if (!bytes) return '';
        if (bytes < 1024) return bytes + ' B';
        else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        else return (bytes / 1048576).toFixed(1) + ' MB';
    };

    if (isImage) {
        return (
            <div className="rounded-lg overflow-hidden border border-zinc-200 bg-zinc-100 max-w-[240px]">
                <div className="relative w-full h-auto min-h-[120px]">
                    <img
                        src={url}
                        alt={name}
                        className="w-full h-auto object-cover max-h-[300px]"
                        loading="lazy"
                        onError={(e) => {
                            console.error('Image failed to load:', url);
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.parentElement!.innerHTML = `<div class="p-2 text-xs text-red-500 break-all border border-red-200 bg-red-50 rounded">Failed to load: ${url}</div>`;
                        }}
                    />
                </div>
            </div>
        );
    }

    if (isVideo) {
        return (
            <div className="rounded-lg overflow-hidden bg-black max-w-[280px]">
                <video controls className="w-full max-h-[300px]">
                    <source src={url} type={type} />
                    Your browser does not support the video tag.
                </video>
            </div>
        );
    }

    // Generic File (PDF, Doc, etc)
    return (
        <a
            href={url}
            download
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 p-3 bg-zinc-50 border border-zinc-200 rounded-xl hover:bg-zinc-100 transition group max-w-[240px]"
        >
            <div className="h-10 w-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center shrink-0">
                <FileText size={20} />
            </div>
            <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-zinc-900 truncate">{name}</p>
                <p className="text-[10px] text-zinc-500">{formatSize(size)} • {type.split('/')[1]?.toUpperCase() || 'FILE'}</p>
            </div>
            <div className="h-8 w-8 text-zinc-400 group-hover:text-zinc-600 flex items-center justify-center">
                <Download size={16} />
            </div>
        </a>
    );
}
