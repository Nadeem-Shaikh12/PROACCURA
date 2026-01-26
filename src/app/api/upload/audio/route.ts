import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get('audio') as File;

        if (!file) {
            return NextResponse.json({ error: 'No audio file uploaded' }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const filename = `audio-${uuidv4()}${path.extname(file.name) || '.webm'}`;

        // Ensure directory exists
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'audio');
        await mkdir(uploadDir, { recursive: true });

        const filePath = path.join(uploadDir, filename);
        await writeFile(filePath, buffer);

        // Return public URL
        const fileUrl = `/uploads/audio/${filename}`;

        return NextResponse.json({
            success: true,
            url: fileUrl,
            duration: 0 // Duration calculation would require ffmpeg, skipping for MVP
        });

    } catch (error) {
        console.error('Audio upload error:', error);
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }
}
