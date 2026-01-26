import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import PDFDocument from 'pdfkit';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key-change-in-production');

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { payload } = await jwtVerify(token, JWT_SECRET);
        const userId = payload.userId as string;
        const { id } = await params;

        const bill = (await db.getBillsByTenant(userId)).find(b => b.id === id);

        if (!bill) {
            return NextResponse.json({ error: 'Bill not found' }, { status: 404 });
        }

        const tenant = await db.findUserById(userId);
        // In a real app we would fetch Landlord and Property details too for the invoice
        // For now using placeholders or minimal data

        // Create PDF
        const doc = new PDFDocument({ margin: 50 });

        const chunks: Buffer[] = [];
        doc.on('data', (chunk) => chunks.push(chunk));

        // --- PDF CONTENT ---

        // Header
        doc.fillColor('#444444')
            .fontSize(20)
            .text('INVOICE', 50, 57)
            .fontSize(10)
            .text(bill.id, 200, 65, { align: 'right' })
            .text(`Date: ${new Date().toLocaleDateString()}`, 200, 80, { align: 'right' })
            .moveDown();

        // Sender (Landlord/System)
        doc.text('ProAccura Property Management', 50, 100)
            .text('123 Smart Street', 50, 115)
            .text('Tech City, TC 10010', 50, 130)
            .moveDown();

        // Bill To
        doc.fillColor('#000000')
            .text('Bill To:', 50, 160)
            .font('Helvetica-Bold')
            .text(tenant?.name || 'Valued Tenant', 50, 175)
            .font('Helvetica')
            .text(tenant?.email || '', 50, 190)
            .moveDown();

        // Table Header
        const invoiceTableTop = 250;
        doc.font('Helvetica-Bold');
        doc.text('Description', 50, invoiceTableTop);
        doc.text('Month', 280, invoiceTableTop);
        doc.text('Amount', 370, invoiceTableTop, { width: 90, align: 'right' });
        doc.text('Status', 470, invoiceTableTop, { width: 90, align: 'right' });

        // Divider
        doc.moveTo(50, invoiceTableTop + 15).lineTo(560, invoiceTableTop + 15).stroke();

        // Item
        doc.font('Helvetica');
        const itemY = invoiceTableTop + 25;
        doc.text(`${bill.type} Payment`, 50, itemY);
        doc.text(bill.month, 280, itemY);
        doc.text(`Rs. ${bill.amount.toFixed(2)}`, 370, itemY, { width: 90, align: 'right' });
        doc.text(bill.status, 470, itemY, { width: 90, align: 'right' });

        // Total
        doc.font('Helvetica-Bold');
        doc.text('Total:', 370, itemY + 30, { width: 90, align: 'right' });
        doc.text(`Rs. ${bill.amount.toFixed(2)}`, 470, itemY + 30, { width: 90, align: 'right' });

        // Signature / Footer
        doc.fontSize(10).text('Thank you for your timely payment.', 50, 700, { align: 'center', width: 500 });

        doc.end();

        const pdfBuffer = await new Promise<Buffer>((resolve) => {
            doc.on('end', () => resolve(Buffer.concat(chunks)));
        });

        return new NextResponse(pdfBuffer as any, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="Invoice-${bill.id}.pdf"`
            }
        });

    } catch (error) {
        console.error("PDF Generate Error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
