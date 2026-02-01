import { NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const filename = `${uuidv4()}-${file.name.replace(/\s+/g, '_')}`;

        // Upload to Cloudinary using a stream
        const result = await new Promise<any>((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: 'tenant_uploads/files',
                    public_id: filename,
                    resource_type: 'auto', // Detects image/pdf/raw
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );
            uploadStream.end(buffer);
        });

        return NextResponse.json({
            success: true,
            url: result.secure_url,
            name: file.name,
            type: file.type,
            size: file.size
        });

    } catch (error: any) {
        console.error('Cloudinary upload error:', error);
        return NextResponse.json({ error: `Upload failed: ${error.message}` }, { status: 500 });
    }
}
