
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

const DB_PATH = path.join(process.cwd(), 'data', 'db.json');

async function setAdminPasswords() {
    try {
        const admins = ['nadimshaikh74161@gmail.com', 'nadeem.shaikh2002@gmail.com'];
        const newPassword = 'admin123';
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        const data = fs.readFileSync(DB_PATH, 'utf-8');
        const db = JSON.parse(data);

        let updatedCount = 0;
        db.users.forEach((user: any) => {
            if (admins.includes(user.email)) {
                user.passwordHash = hashedPassword;
                updatedCount++;
            }
        });

        if (updatedCount === 0) {
            console.log('No admin users found!');
            return;
        }

        fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
        console.log(`Successfully reset ${updatedCount} admin passwords to: ${newPassword}`);
    } catch (error) {
        console.error('Error resetting passwords:', error);
    }
}

setAdminPasswords();
