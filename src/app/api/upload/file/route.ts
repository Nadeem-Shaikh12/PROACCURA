import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const ext = path.extname(file.name) || '';
        const filename = `file-${uuidv4()}${ext}`;

        // Ensure directory exists
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'files');
        await mkdir(uploadDir, { recursive: true });

        const filePath = path.join(uploadDir, filename);
        await writeFile(filePath, buffer);

        // Return file info
        return NextResponse.json({
            success: true,
            url: `/uploads/files/${filename}`,
            name: file.name,
            type: file.type,
            size: file.size
        });

    } catch (error) {
        console.error('File upload error:', error);
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }
}
