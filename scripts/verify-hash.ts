
import bcrypt from 'bcryptjs';

const hash = '$2b$10$fXsJ.Cb3JNwLX/dsuVNvw.DZHGJP13u8zkYsrhD4v3H45U9ho0fXe';
const password = 'admin123';

async function verify() {
    const isValid = await bcrypt.compare(password, hash);
    console.log(`Verification for 'admin123': ${isValid ? '✅ Valid' : '❌ Invalid'}`);
}

verify();
