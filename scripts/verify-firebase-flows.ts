
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// 1. Load .env.local manually BEFORE importing db
console.log("📂 Loading environment variables...");
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach(line => {
        const firstEqual = line.indexOf('=');
        if (firstEqual === -1) return;

        const key = line.substring(0, firstEqual).trim();
        const value = line.substring(firstEqual + 1).trim();

        if (key && value) {
            process.env[key] = value.replace(/^["']|["']$/g, ''); // Remove quotes
            // Special handling for private key newlines
            if (key === 'FIREBASE_PRIVATE_KEY') {
                process.env[key] = value.replace(/^"|"$/g, '').replace(/\\n/g, '\n');
            }
        }
    });
    console.log("✅ Environment variables loaded.");
} else {
    console.error("❌ .env.local not found!");
    process.exit(1);
}

// 2. Dynamic Import of DB (now that env is set)
async function testFlows() {
    console.log("🚀 Starting Firebase Flow Verification...");

    // Dynamic import to ensure process.env is ready
    const { db } = await import('../src/lib/db');
    // Import types typically don't trigger side effects, but we can't dynamic import types easily for variables. 
    // We'll cast as needed or import types at top level if they are just interfaces.
    // Actually, importing types is fine as they are erased at runtime.

    try {
        // 1. Test Stats (Read)
        console.log("\n1. Testing getPlatformStats()...");
        const stats = await db.getPlatformStats();
        console.log("✅ Stats retrieved:", JSON.stringify(stats, null, 2));

        // 2. Test Add Property (Write)
        console.log("\n2. Testing addProperty()...");
        const mockProperty = {
            id: uuidv4(),
            landlordId: 'test-landlord-id',
            name: "Test Property " + new Date().toISOString(),
            address: "123 Test St",
            totalUnits: 5,
            vacantUnits: 5,
            rentAmount: 1000,
            tenants: [],
            // Add other required fields if any
            occupiedUnits: 0,
            type: 'Apartment',
            monthlyRent: 1000
        };

        // Cast to any to avoid type check issues if type import is tricky
        const addedProp = await db.addProperty(mockProperty as any);
        console.log("✅ Property added:", addedProp.id);

        // 3. Test Get Properties (Read)
        console.log("\n3. Testing getProperties()...");
        const props = await db.getProperties(mockProperty.landlordId);
        const savedProp = props.find(p => p.id === mockProperty.id);

        if (savedProp) {
            console.log("✅ Property retrieved successfully:", savedProp.name);
        } else {
            console.error("❌ Failed to retrieve the property we just added!");
        }

        // 4. Test Get Users (Read - General)
        console.log("\n4. Testing getUsers()...");
        const users = await db.getUsers();
        console.log(`✅ Retrieved ${users.length} users.`);

    } catch (error: any) {
        console.error("\n❌ TEST FAILED:");
        console.error(error);
    } finally {
        process.exit(0);
    }
}

testFlows();

