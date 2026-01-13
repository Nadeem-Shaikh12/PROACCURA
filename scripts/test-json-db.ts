
import { db } from '../src/lib/db';

async function testJSONDB() {
    console.log('Testing JSON DB Adapter...');

    // 1. Test Users
    console.log('--- Testing Users ---');
    const email = `testuser_${Date.now()}@example.com`;
    const newUser = await db.addUser({
        id: `user_${Date.now()}`,
        name: 'Test User',
        email,
        passwordHash: 'hashedpassword',
        role: 'landlord'
    });
    console.log('User Added:', newUser.email);

    const fetchedUser = await db.findUserByEmail(email);
    console.log('User Fetched:', fetchedUser?.email === email ? '✅ Success' : '❌ Failed');

    // 2. Test Properties
    console.log('\n--- Testing Properties ---');
    const newProperty = await db.addProperty({
        id: `prop_${Date.now()}`,
        landlordId: newUser.id,
        name: 'Test Apartment',
        address: '123 Test St',
        units: 5,
        occupiedUnits: 0,
        monthlyRent: 1000,
        type: 'Apartment',
        createdAt: new Date().toISOString()
    });
    console.log('Property Added:', newProperty.name);

    const properties = await db.getProperties(newUser.id);
    console.log('Properties Fetched:', properties.length === 1 ? '✅ Success' : '❌ Failed');

    console.log('\nALL TESTS COMPLETED');
}

testJSONDB().catch(console.error);
