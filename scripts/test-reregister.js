
// Mock DB interactions for testing
const mockDb = {
    users: [
        {
            id: 'removed-user-id',
            name: 'Kshitij Pingale',
            email: 'kshitijpingale@gmail.com',
            status: 'removed',
            role: 'tenant',
            passwordHash: 'oldhash'
        }
    ],
    updateUser: function (id, updates) {
        const user = this.users.find(u => u.id === id);
        if (user) {
            Object.assign(user, updates);
            return user;
        }
        return null;
    }
};

async function testReRegistration() {
    const email = 'kshitijpingale@gmail.com';
    const normalizedEmail = email.toLowerCase().trim();

    console.log(`Testing re-registration for: ${normalizedEmail}`);

    const existingUser = mockDb.users.find(u => u.email === normalizedEmail);

    if (existingUser) {
        console.log(`User found: ${existingUser.name}, Status: ${existingUser.status}`);

        if (existingUser.status === 'removed') {
            console.log('User is removed. Attempting resurrection...');

            const updatedUser = mockDb.updateUser(existingUser.id, {
                status: 'inactive',
                passwordHash: 'newhash'
            });

            if (updatedUser && updatedUser.status === 'inactive' && updatedUser.passwordHash === 'newhash') {
                console.log('SUCCESS: User resurrected and updated.');
            } else {
                console.error('FAILURE: User update failed.');
            }
        } else {
            console.log('User exists but is NOT removed. Registration should be blocked.');
        }
    } else {
        console.log('User not found. Normal registration flow.');
    }
}

testReRegistration();
