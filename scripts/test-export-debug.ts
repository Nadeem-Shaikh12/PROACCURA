import { db } from '../src/lib/db';
import PDFDocument from 'pdfkit';
import AdmZip from 'adm-zip';
import fs from 'fs';

async function testExport() {
    console.log("Starting Export Test...");
    try {
        // Mock User ID - we need a valid tenant ID to test
        const users = await db.getUsers();
        const tenant = users.find(u => u.role === 'tenant');

        if (!tenant) {
            console.error("No tenant found in DB to test with.");
            return;
        }

        const userId = tenant.id;
        console.log(`Testing with Tenant ID: ${userId}`);

        // 1. Test Data Fetching
        console.log("Fetching data...");
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
        console.log("Data fetched successfully.");
        console.log(`Messages found: ${messages.length}`);

        // 2. Test ZIP Creation
        console.log("Creating ZIP...");
        const zip = new AdmZip();
        zip.addFile("data/profile.json", Buffer.from(JSON.stringify(user, null, 2)));
        // ... (skipping full ZIP population for brevity, just testing libs)

        // 3. Test PDF Generation
        console.log("Generating PDF...");
        const pdfBuffer = await new Promise<Buffer>((resolve, reject) => {
            const doc = new PDFDocument({ margin: 50 });
            const chunks: Buffer[] = [];
            doc.on('data', chunk => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);

            doc.fontSize(20).text('Test PDF', { align: 'center' });
            doc.text(`Tenant: ${user?.name}`);
            if (docs.length > 0) {
                docs.forEach((d, i) => {
                    // Test the property access that failed before
                    doc.text(`${i + 1}. ${d.name} (${d.category})`);
                });
            }
            doc.end();
        });
        console.log(`PDF Generated. Size: ${pdfBuffer.length} bytes`);

        zip.addFile("test_report.pdf", pdfBuffer);
        const zipBuffer = zip.toBuffer();
        console.log(`ZIP Generated. Size: ${zipBuffer.length} bytes`);

        fs.writeFileSync("test_export.zip", zipBuffer);
        console.log("Saved test_export.zip");

    } catch (error) {
        console.error("Test Failed:", error);
    }
}

testExport();
