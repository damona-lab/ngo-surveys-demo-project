import 'dotenv/config';
import { connectDatabase, closeDatabase } from '../server/db.js';
import { User } from '../server/models.js';
import { hashPassword } from '../server/auth.js';

const name = String(process.env.ADMIN_NAME || '').trim();
const email = String(process.env.ADMIN_EMAIL || '').trim().toLowerCase();
const phone = String(process.env.ADMIN_PHONE || '').replace(/\s/g, '');
const password = String(process.env.ADMIN_PASSWORD || '');

if (name.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !/^(?:07|01)\d{8}$/.test(phone) || password.length < 12 || password.length > 72) {
  console.error('Set ADMIN_NAME, ADMIN_EMAIL, ADMIN_PHONE, and ADMIN_PASSWORD (12–72 characters) before running npm run admin:create.');
  process.exitCode = 1;
} else {
  try {
    await connectDatabase();
    const existing = await User.findOne({ email }).select('+password_hash');
    const passwordHash = await hashPassword(password);
    if (existing) {
      existing.name = name;
      existing.phone = phone;
      existing.password_hash = passwordHash;
      existing.role = 'admin';
      existing.status = 'active';
      await existing.save();
    } else {
      await User.create({ name, email, phone, password_hash: passwordHash, role: 'admin', status: 'active', balance: 0, total_earned: 0 });
    }
    console.log(`Administrator ready: ${email}`);
    console.log('Sign in at /admin using ADMIN_EMAIL and ADMIN_PASSWORD.');
  } finally {
    await closeDatabase();
  }
}
