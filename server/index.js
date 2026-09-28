import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import nodemailer from 'nodemailer';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import pool from './db.js';
import { hashPassword, verifyPassword, signToken, verifyToken, newResetToken } from './auth.js';
import { SURVEY_SETS } from '../src/surveysData.js';

const app = express();
const isProd = process.env.NODE_ENV === 'production';
const port = Number(process.env.PORT || 3000);
const cookieName = 'ngo_session';
const cookieOptions = { httpOnly: true, secure: isProd, sameSite: 'strict', path: '/', maxAge: 12 * 60 * 60 * 1000 };

app.disable('x-powered-by');
app.use(helmet({ contentSecurityPolicy: { directives: { defaultSrc: ["'self'"], scriptSrc: ["'self'", 'https://unpkg.com'], styleSrc: ["'self'", "'unsafe-inline'"], imgSrc: ["'self'", 'data:'], connectSrc: ["'self'"], objectSrc: ["'none'"], upgradeInsecureRequests: isProd ? [] : null } } }));
app.use(express.json({ limit: '20kb' }));
app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: true, legacyHeaders: false }));

function tokenFor(req) {
  const token = req.cookies?.[cookieName] || req.get('authorization')?.replace(/^Bearer\s+/i, '');
  return token ? verifyToken(token) : null;
}
// Parse only the one signed session cookie; no third party cookie middleware is needed.
app.use((req, _res, next) => {
  req.cookies = Object.fromEntries((req.headers.cookie || '').split(';').map(x => x.trim()).filter(Boolean).map(x => {
    const i = x.indexOf('='); return [decodeURIComponent(x.slice(0, i)), decodeURIComponent(x.slice(i + 1))];
  }));
  next();
});

async function requireUser(req, res, next) {
  try {
    const claims = tokenFor(req);
    if (!claims) return res.status(401).json({ error: 'Please sign in.' });
    const [rows] = await pool.execute("SELECT id,name,email,balance,total_earned FROM users WHERE id=? AND status='active'", [claims.sub]);
    if (!rows.length) return res.status(401).json({ error: 'Please sign in.' });
    req.user = rows[0]; next();
  } catch { res.status(401).json({ error: 'Your session has expired. Please sign in again.' }); }
}

function setSession(res, user) { res.cookie(cookieName, signToken(user), cookieOptions); }
function publicUser(user) { return { id: user.id, name: user.name, email: user.email, balance: Number(user.balance), totalEarned: Number(user.total_earned) }; }

app.post('/api/auth/signup', async (req, res, next) => {
  try {
    const name = String(req.body.name || '').trim();
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    if (name.length < 2 || name.length > 120 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 255 || password.length < 10 || password.length > 72) return res.status(400).json({ error: 'Enter a valid name and email, and a password of 10–72 characters.' });
    const [result] = await pool.execute('INSERT INTO users(name,email,password_hash) VALUES(?,?,?)', [name,email,await hashPassword(password)]);
    const user = { id: result.insertId, name, email, balance: 0, total_earned: 0 }; setSession(res,user);
    res.status(201).json({ user: publicUser(user) });
  } catch (err) { if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'An account with this email already exists.' }); next(err); }
});

app.post('/api/auth/login', async (req, res, next) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const [rows] = await pool.execute("SELECT id,name,email,password_hash,balance,total_earned FROM users WHERE email=? AND status='active'", [email]);
    const user = rows[0];
    if (!user || !(await verifyPassword(String(req.body.password || ''), user.password_hash))) return res.status(401).json({ error: 'Email or password is incorrect.' });
    setSession(res,user); res.json({ user: publicUser(user) });
  } catch (err) { next(err); }
});

app.post('/api/auth/logout', (_req,res) => { res.clearCookie(cookieName, { ...cookieOptions, maxAge: undefined }); res.status(204).end(); });
app.get('/api/auth/me', requireUser, (req,res) => res.json({ user: publicUser(req.user) }));
app.get('/api/health', async (_req,res) => { try { await pool.query('SELECT 1'); res.json({ok:true}); } catch { res.status(503).json({ok:false}); } });

app.post('/api/auth/reset-request', async (req,res,next) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const [users] = await pool.execute('SELECT id,email FROM users WHERE email=? AND status=\'active\'', [email]);
    if (users.length && process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      const raw = newResetToken(); const digest = createHash('sha256').update(raw).digest('hex');
      await pool.execute('UPDATE password_resets SET used=1 WHERE user_id=? AND used=0', [users[0].id]);
      await pool.execute('INSERT INTO password_resets(user_id,token,expires_at) VALUES(?,?,DATE_ADD(UTC_TIMESTAMP(),INTERVAL 1 HOUR))', [users[0].id,digest]);
      const transport = nodemailer.createTransport({ host: process.env.SMTP_HOST, port: Number(process.env.SMTP_PORT || 587), secure: process.env.SMTP_SECURE === 'true', auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } });
      const link = `${process.env.APP_URL}/?reset=${encodeURIComponent(raw)}`;
      await transport.sendMail({ from: process.env.SMTP_FROM || process.env.SMTP_USER, to: users[0].email, subject: 'Reset your NGO Surveys password', text: `Use this link within one hour to reset your password: ${link}` });
    }
    res.json({ message: 'If an account matches that email and email delivery is configured, a reset link will arrive shortly.' });
  } catch (err) { next(err); }
});

app.post('/api/auth/reset', async (req,res,next) => {
  try {
    const token = String(req.body.token || ''); const password = String(req.body.password || '');
    if (!/^[a-f0-9]{64}$/.test(token) || password.length < 10 || password.length > 72) return res.status(400).json({ error: 'The reset link or new password is invalid.' });
    const digest = createHash('sha256').update(token).digest('hex');
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      const [rows] = await conn.execute('SELECT id,user_id FROM password_resets WHERE token=? AND used=0 AND expires_at>UTC_TIMESTAMP() FOR UPDATE', [digest]);
      if (!rows.length) { await conn.rollback(); return res.status(400).json({ error: 'This reset link is invalid or expired.' }); }
      await conn.execute('UPDATE users SET password_hash=? WHERE id=?', [await hashPassword(password), rows[0].user_id]);
      await conn.execute('UPDATE password_resets SET used=1 WHERE user_id=?', [rows[0].user_id]);
      await conn.execute('DELETE FROM refresh_tokens WHERE user_id=?', [rows[0].user_id]);
      await conn.commit(); res.json({ message: 'Password updated. You can now sign in.' });
    } catch (err) { await conn.rollback(); throw err; } finally { conn.release(); }
  } catch (err) { next(err); }
});

app.get('/api/state', requireUser, async (req,res,next) => {
  try {
    const [surveys] = await pool.execute('SELECT survey_id,unlocked FROM user_surveys WHERE user_id=?', [req.user.id]);
    const [answers] = await pool.execute('SELECT survey_id,question_id,answer_index FROM user_answers WHERE user_id=?', [req.user.id]);
    const [withdrawals] = await pool.execute('SELECT amount,created_at AS at,status FROM withdrawals WHERE user_id=? ORDER BY id DESC', [req.user.id]);
    const state = { balance:Number(req.user.balance),totalEarned:Number(req.user.total_earned),surveys:{},withdrawals };
    for (const row of surveys) state.surveys[row.survey_id] = { unlocked:!!row.unlocked, completedQuestions:[] };
    for (const row of answers) { (state.surveys[row.survey_id] ||= {unlocked:true,completedQuestions:[]}).completedQuestions.push(row.question_id); }
    res.json({ user:publicUser(req.user),state });
  } catch (err) { next(err); }
});

app.post('/api/answers', requireUser, async (req,res,next) => {
  try {
    const { surveyId, questionId, answerIndex } = req.body;
    const survey = SURVEY_SETS.find(s => s.id === surveyId); const question = survey?.questions.find(q => q.id === questionId);
    if (!question || !Number.isInteger(answerIndex) || answerIndex < 0 || answerIndex >= question.options.length) return res.status(400).json({error:'Invalid survey answer.'});
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      const [dupe] = await conn.execute('SELECT 1 FROM user_answers WHERE user_id=? AND survey_id=? AND question_id=?', [req.user.id,surveyId,questionId]);
      if (dupe.length) { await conn.rollback(); return res.status(409).json({error:'This question was already answered.'}); }
      const [progress] = await conn.execute('SELECT unlocked FROM user_surveys WHERE user_id=? AND survey_id=? FOR UPDATE', [req.user.id,surveyId]);
      if (survey.unlockFee > 0 && !progress[0]?.unlocked) { await conn.rollback(); return res.status(403).json({error:'Unlock this survey first.'}); }
      await conn.execute('INSERT INTO user_surveys(user_id,survey_id,unlocked) VALUES(?,?,1) ON DUPLICATE KEY UPDATE unlocked=1', [req.user.id,surveyId]);
      await conn.execute('INSERT INTO user_answers(user_id,survey_id,question_id,answer_index,reward) VALUES(?,?,?,?,?)', [req.user.id,surveyId,questionId,answerIndex,survey.rewardPerQuestion]);
      await conn.execute('UPDATE users SET balance=balance+?,total_earned=total_earned+? WHERE id=?', [survey.rewardPerQuestion,survey.rewardPerQuestion,req.user.id]);
      await conn.commit(); res.json({ reward:survey.rewardPerQuestion });
    } catch (err) { await conn.rollback(); throw err; } finally { conn.release(); }
  } catch (err) { next(err); }
});

app.post('/api/surveys/:id/unlock', requireUser, async (req,res,next) => {
  try {
    const survey = SURVEY_SETS.find(s => s.id === req.params.id);
    if (!survey) return res.status(404).json({error:'Survey not found.'});
    // Payment verification is a separate provider integration; never trust pasted SMS text as proof of payment.
    if (survey.unlockFee > 0) return res.status(501).json({error:'Paid survey unlocks require a verified payment provider.'});
    await pool.execute('INSERT INTO user_surveys(user_id,survey_id,unlocked) VALUES(?,?,1) ON DUPLICATE KEY UPDATE unlocked=1', [req.user.id,survey.id]);
    res.json({ok:true});
  } catch(err) { next(err); }
});

app.post('/api/withdrawals', requireUser, async (req,res,next) => {
  try {
    const name=String(req.body.name||'').trim(), phone=String(req.body.phone||'').replace(/\s/g,''), amount=Number(req.body.amount);
    if (!name || name.length > 200 || !/^(?:07|01)\d{8}$/.test(phone) || !Number.isFinite(amount) || amount < 500) return res.status(400).json({error:'Enter valid payout details and at least KSh 500.'});
    const conn=await pool.getConnection();
    try { await conn.beginTransaction(); const [rows]=await conn.execute('SELECT balance FROM users WHERE id=? FOR UPDATE',[req.user.id]);
      if (amount > Number(rows[0].balance)) { await conn.rollback(); return res.status(400).json({error:'Insufficient balance.'}); }
      await conn.execute('UPDATE users SET balance=balance-? WHERE id=?',[amount,req.user.id]);
      await conn.execute('INSERT INTO withdrawals(user_id,recipient_name,phone,amount) VALUES(?,?,?,?)',[req.user.id,name,phone,amount]);
      await conn.commit(); res.status(201).json({ok:true});
    } catch(err) { await conn.rollback(); throw err; } finally { conn.release(); }
  } catch(err) { next(err); }
});

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../dist');
app.use(express.static(root));
app.get('/{*path}', (_req,res) => res.sendFile(path.join(root,'index.html')));
app.use((err,_req,res,_next) => { console.error(err); res.status(500).json({error:'A server error occurred.'}); });

await pool.query('SELECT 1');
app.listen(port, () => console.log(`NGO Surveys listening on port ${port}`));
