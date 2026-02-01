import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import PDFDocument from 'pdfkit';
import AdmZip from 'adm-zip';
import path from 'path';

export const runtime = 'nodejs'; // Ensure this runs in Node runtime, not Edge

export async function GET() {
    try {
        // 1. Auth Check
        console.log('[EXPORT API] Starting request...');
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;

        if (!token) {
            console.log('[EXPORT API] No token found');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key-change-in-production');
        let payload;
        try {
            const verified = await jwtVerify(token, secret);
            payload = verified.payload;
            console.log('[EXPORT API] User Verified:', payload.userId);
        } catch (e) {
            console.error('[EXPORT API] Token Verification Failed:', e);
            return NextResponse.json({ error: 'Invalid Token' }, { status: 403 });
        }

        const userId = payload.userId as string;

        // 2. Data Fetching
        const [
            user,
            tenantStay,
            verificationRequest,
            history,
            payments,
            messages,
            docs,
            reviews
        ] = await Promise.all([
            db.findUserById(userId),
            db.getTenantStay(userId),
            db.findTenantRequest(userId),
            db.getTenantHistory(userId),
            db.getBillsByTenant(userId),
            db.getAllMessagesForUser(userId),
            db.getDocumentsByTenant(userId),
            db.getReviews(userId)
        ]);

        console.log('[EXPORT API] Data Fetched Successfully');

        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        // 3. ZIP Creation
        const zip = new AdmZip();

        // Add detailed JSON data
        zip.addFile("data/profile.json", Buffer.from(JSON.stringify(user, null, 2)));
        zip.addFile("data/lease_details.json", Buffer.from(JSON.stringify(tenantStay || {}, null, 2)));
        zip.addFile("data/verification_request.json", Buffer.from(JSON.stringify(verificationRequest || {}, null, 2)));
        zip.addFile("data/activity_history.json", Buffer.from(JSON.stringify(history, null, 2)));
        zip.addFile("data/payments.json", Buffer.from(JSON.stringify(payments, null, 2)));
        zip.addFile("data/messages.json", Buffer.from(JSON.stringify(messages, null, 2)));
        zip.addFile("data/documents_metadata.json", Buffer.from(JSON.stringify(docs, null, 2)));
        zip.addFile("data/reviews.json", Buffer.from(JSON.stringify(reviews, null, 2)));

        // 4. PDF Generation
        console.log('[EXPORT API] Starting PDF Generation (Professional Mode)...');
        const pdfBuffer = await new Promise<Buffer>((resolve, reject) => {
            const doc = new PDFDocument({ margin: 50 });
            const chunks: Buffer[] = [];

            doc.on('data', chunk => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);

            // --- PDF CONTENT START ---

            // COLORS
            const PRIMARY_COLOR = '#1e3a8a'; // Dark Blue
            const SECONDARY_COLOR = '#64748b'; // Slate 500
            const BORDER_COLOR = '#e2e8f0';

            // Helper: Section Header
            const sectionHeader = (title: string, y?: number) => {
                doc.moveDown(2);
                const currentY = y || doc.y;
                doc.rect(50, currentY, 500, 25).fill(PRIMARY_COLOR);
                doc.fillColor('white').fontSize(12).font('Helvetica-Bold').text(title, 60, currentY + 7);
                doc.moveDown(1.5);
                doc.fillColor('black');
            };

            // Helper: Key-Value Row
            const row = (key: string, value: string) => {
                const y = doc.y;
                doc.fontSize(10).font('Helvetica-Bold').fillColor('#334155').text(key, 50, y, { width: 150 });
                doc.font('Helvetica').fillColor('#0f172a').text(value, 200, y);
                doc.moveDown(0.5);
            };

            // Header
            try {
                // Try multiple common paths for robustness
                const logoPath = path.join(process.cwd(), 'public', 'globe.svg');
                doc.image(logoPath, 50, 45, { width: 30 }).stroke();
            } catch (e) {
                console.warn("Logo image not found, skipping:", e);
                // Fallback text if logo fails
                doc.fontSize(10).fillColor(PRIMARY_COLOR).text('[Logo]', 50, 50);
            }

            // Header Text
            doc.fontSize(20).font('Helvetica-Bold').fillColor(PRIMARY_COLOR).text('TENANT DATA EXPORT', { align: 'right' });
            doc.fontSize(10).font('Helvetica').fillColor(SECONDARY_COLOR).text(`Generated: ${new Date().toLocaleDateString()}`, { align: 'right' });
            doc.text(`Reference ID: ${user.id.substring(0, 8).toUpperCase()}`, { align: 'right' });

            doc.moveDown(3);
            doc.fontSize(10).font('Helvetica').fillColor('#333')
                .text('This document contains a comprehensive record of your personal data, lease details, and activity history as stored in our system, in compliance with data portability regulations.', 50, doc.y, { width: 500, align: 'justify' });

            // 1. Personal Profile
            sectionHeader('PERSONAL PROFILE');
            row('Full Name', user.name);
            row('Email Address', user.email);
            row('Mobile Number', user.mobile || 'Not Verified');
            row('User Role', user.role.toUpperCase());
            row('Account ID', user.id);

            // 2. Lease & Property Details
            sectionHeader('LEASE & PROPERTY DETAILS');
            if (tenantStay) {
                row('Property Status', tenantStay.status);
                row('Join Date', new Date(tenantStay.joinDate).toLocaleDateString());
                if (verificationRequest) {
                    row('Property Address', verificationRequest.city || 'N/A');
                }
            } else {
                doc.font('Helvetica-Oblique').text('No active lease record found.', 50, doc.y);
            }

            // 3. Document Records
            sectionHeader('UPLOADED DOCUMENTS');
            if (docs.length > 0) {
                doc.fontSize(10).font('Helvetica-Bold').text('Document Name', 50, doc.y);
                doc.text('Category', 300, doc.y);
                doc.text('Upload Date', 450, doc.y);
                doc.moveTo(50, doc.y + 5).lineTo(550, doc.y + 5).strokeColor(PRIMARY_COLOR).stroke();
                doc.moveDown(0.8);

                docs.forEach((d) => {
                    const y = doc.y;
                    doc.font('Helvetica').fillColor('#333').text(d.name, 50, y, { width: 240 });
                    doc.text(d.category, 300, y);
                    doc.text(new Date(d.createdAt).toLocaleDateString(), 450, y);
                    doc.moveDown(0.5);
                });
            } else {
                doc.font('Helvetica-Oblique').text('No documents uploaded.', 50, doc.y);
            }

            // 4. Payment History (Recent)
            sectionHeader('PAYMENT HISTORY (LAST 10)');
            if (payments.length > 0) {
                // Table Header
                const startY = doc.y;
                doc.rect(50, startY, 500, 20).fill('#f1f5f9');
                doc.fillColor('#333').font('Helvetica-Bold').fontSize(9);
                doc.text('Date', 60, startY + 5);
                doc.text('Type', 150, startY + 5);
                doc.text('Amount', 300, startY + 5);
                doc.text('Status', 450, startY + 5);
                doc.moveDown(1.5);

                payments.slice(0, 10).forEach((p) => {
                    const y = doc.y;
                    doc.font('Helvetica').fontSize(9).fillColor('#333');
                    doc.text(new Date(p.dueDate).toLocaleDateString(), 60, y);
                    doc.text(p.type, 150, y);
                    doc.text(`INR ${p.amount}`, 300, y);

                    const statusColor = p.status === 'PAID' ? '#16a34a' : '#dc2626';
                    doc.fillColor(statusColor).text(p.status, 450, y);

                    doc.moveDown(0.8);
                    doc.moveTo(50, doc.y).lineTo(550, doc.y).strokeColor('#f1f5f9').stroke();
                    doc.moveDown(0.5);
                });
            } else {
                doc.font('Helvetica-Oblique').text('No payment records found.', 50, doc.y);
            }

            // Disclaimer Footer
            const bottomY = 700;
            doc.moveTo(50, bottomY).lineTo(550, bottomY).strokeColor(BORDER_COLOR).stroke();
            doc.fontSize(8).fillColor('#94a3b8').text('This report is generated automatically by the Tenant Portal system. For any discrepancies, please contact your landlord or support.', 50, bottomY + 10, { align: 'center' });

            // --- PDF CONTENT END ---
            doc.end();

        });

        zip.addFile("Tenant_Summary_Report.pdf", pdfBuffer);

        const zipBuffer = zip.toBuffer();

        // 5. Return Response
        return new NextResponse(new Blob([new Uint8Array(zipBuffer)]), {
            status: 200,
            headers: {
                'Content-Type': 'application/zip',
                'Content-Disposition': `attachment; filename="Tenant_Data_Export_${user.name.replace(/\s+/g, '_')}_${Date.now()}.zip"`
            }
        });

    } catch (error: any) {
        console.error("Export Error:", error);
        return NextResponse.json({ error: `Data Export Failed: ${error.message || String(error)}` }, { status: 500 });
    }
}
