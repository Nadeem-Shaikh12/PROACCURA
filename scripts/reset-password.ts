
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

const DB_PATH = path.join(process.cwd(), 'data', 'db.json');

async function resetPassword() {
    try {
        const email = 'nadeemshaikh@gmail.com'; // Target user
        const newPassword = 'password123';
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        const data = fs.readFileSync(DB_PATH, 'utf-8');
        const db = JSON.parse(data);

        const userIndex = db.users.findIndex((u: any) => u.email === email);

        if (userIndex === -1) {
            console.log('User not found!');
            return;
        }

        db.users[userIndex].passwordHash = hashedPassword;

        fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
        console.log(`Password for ${email} reset to: ${newPassword}`);
    } catch (error) {
        console.error('Error resetting password:', error);
    }
}

resetPassword();
