import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomBytes } from 'node:crypto';

const secret = process.env.JWT_SECRET;
if (!secret || secret.length < 32) throw new Error('Set JWT_SECRET to a random secret of at least 32 characters.');

export const hashPassword = password => bcrypt.hash(password, 12);
export const verifyPassword = (password, hash) => bcrypt.compare(password, hash);
export const signToken = user => jwt.sign({ sub: String(user.id) }, secret, { expiresIn: '12h', issuer: 'ngo-surveys' });
export const verifyToken = token => jwt.verify(token, secret, { issuer: 'ngo-surveys' });
export const newResetToken = () => randomBytes(32).toString('hex');
