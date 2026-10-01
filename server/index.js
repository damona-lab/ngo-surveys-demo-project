import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import nodemailer from 'nodemailer';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { connectDatabase, closeDatabase, ping, isDuplicateKeyError, isValidationError, inSession, runInTransaction } from './db.js';
import { User, Survey, UserSurvey, UserAnswer, Withdrawal, PasswordReset, RefreshToken } from './models.js';
import { hashPassword, verifyPassword, signToken, verifyToken, newResetToken } from './auth.js';
import { SURVEY_SETS } from '../src/surveysData.js';

const app = express();
const isProd = process.env.NODE_ENV === 'production';
const port = Number(process.env.PORT || 3000);
const cookieName = 'ngo_session';
const cookieOptions = { httpOnly: true, secure: isProd, sameSite: isProd && process.env.CROSS_SITE_COOKIES === 'true' ? 'none' : 'strict', path: '/', maxAge: 12 * 60 * 60 * 1000 };

app.disable('x-powered-by');
app.use(helmet({ contentSecurityPolicy: { directives: { defaultSrc: ["'self'"], scriptSrc: ["'self'", 'https://unpkg.com'], styleSrc: ["'self'", "'unsafe-inline'"], imgSrc: ["'self'", 'data:'], connectSrc: ["'self'"], objectSrc: ["'none'"], upgradeInsecureRequests: isProd ? [] : null } } }));
const frontendOrigins = (process.env.FRONTEND_URL || '').split(',').map(origin => origin.trim().replace(/\/$/, '')).filter(Boolean);
app.use((req, res, next) => {
  const origin = req.get('origin');
  if (origin && frontendOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Vary', 'Origin');
    if (req.method === 'OPTIONS') return res.sendStatus(204);
  }
  next();
});
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
    const user = await User.findOne({ _id: claims.sub, status: 'active' }).select('name email balance total_earned').lean();
    if (!user) return res.status(401).json({ error: 'Please sign in.' });
    req.user = user; next();
  } catch { res.status(401).json({ error: 'Your session has expired. Please sign in again.' }); }
}

function setSession(res, user) { res.cookie(cookieName, signToken(user), cookieOptions); }
function publicUser(user) { return { id: String(user._id), name: user.name, email: user.email, balance: Number(user.balance), totalEarned: Number(user.total_earned) }; }

app.post('/api/auth/signup', async (req, res, next) => {
  try {
    const name = String(req.body.name || '').trim();
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    if (name.length < 2 || name.length > 120 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 255 || password.length < 10 || password.length > 72) return res.status(400).json({ error: 'Enter a valid name and email, and a password of 10–72 characters.' });
    const user = await User.create({ name, email, password_hash: await hashPassword(password), balance: 0, total_earned: 0, status: 'active' });
    setSession(res, user);
    res.status(201).json({ user: publicUser(user) });
  } catch (err) {
    if (isDuplicateKeyError(err)) return res.status(409).json({ error: 'An account with this email already exists.' });
    if (isValidationError(err)) return res.status(400).json({ error: 'Enter a valid name and email, and a password of 10–72 characters.' });
    next(err);
  }
});

app.post('/api/auth/login', async (req, res, next) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    // password_hash is not selected by default, so it is requested explicitly here.
    const user = await User.findOne({ email, status: 'active' }).select('+password_hash').lean();
    if (!user || !(await verifyPassword(String(req.body.password || ''), user.password_hash))) return res.status(401).json({ error: 'Email or password is incorrect.' });
    setSession(res, user); res.json({ user: publicUser(user) });
  } catch (err) { next(err); }
});

app.post('/api/auth/logout', (_req, res) => { res.clearCookie(cookieName, { ...cookieOptions, maxAge: undefined }); res.status(204).end(); });
app.get('/api/auth/me', requireUser, (req, res) => res.json({ user: publicUser(req.user) }));
app.get('/api/health', async (_req, res) => { try { await ping(); res.json({ ok: true }); } catch { res.status(503).json({ ok: false }); } });

// Reused SMTP transport for password reset email, created on first use.
let mailTransportInstance = null;
function mailTransport() {
  if (!mailTransportInstance) {
    mailTransportInstance = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === 'true',
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  }
  return mailTransportInstance;
}

app.post('/api/auth/reset-request', async (req, res, next) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const account = await User.findOne({ email, status: 'active' }).select('email').lean();
    if (account && process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      const raw = newResetToken(); const digest = createHash('sha256').update(raw).digest('hex');
      // Previously issued links are left valid until they are used (or expire), so a user who
      // clicks an earlier reset email still succeeds instead of hitting "invalid or expired".
      // Every token stays single-use, and a successful reset invalidates all of them.
      await PasswordReset.create({ user_id: account._id, token: digest, used: false, expires_at: new Date(Date.now() + 60 * 60 * 1000) });
      const link = `${process.env.APP_URL}/?reset=${encodeURIComponent(raw)}`;
      // Delivery problems are logged but never surfaced, so the response is identical
      // whether or not the address exists and the endpoint cannot enumerate accounts.
      try {
        await mailTransport().sendMail({
          from: process.env.SMTP_FROM || process.env.SMTP_USER,
          to: account.email,
          subject: 'Reset your NGO Surveys password',
          text: `Use this link within one hour to reset your NGO Surveys password: ${link}\n\nIf you did not request this, you can ignore this email.`,
          html: `<p>Use this link within one hour to reset your <strong>NGO Surveys</strong> password:</p><p><a href="${link}">Reset my password</a></p><p>If you did not request this, you can safely ignore this email.</p>`,
        });
      } catch (mailError) {
        console.error('Password reset email failed:', mailError.message);
      }
    }
    res.json({ message: 'If an account matches that email and email delivery is configured, a reset link will arrive shortly.' });
  } catch (err) { next(err); }
});

app.post('/api/auth/reset', async (req, res, next) => {
  try {
    const token = String(req.body.token || ''); const password = String(req.body.password || '');
    if (!/^[a-f0-9]{64}$/.test(token) || password.length < 10 || password.length > 72) return res.status(400).json({ error: 'The reset link or new password is invalid.' });
    const digest = createHash('sha256').update(token).digest('hex');
    const outcome = await runInTransaction(async session => {
      const reset = await inSession(PasswordReset.findOne({ token: digest, used: false, expires_at: { $gt: new Date() } }), session).lean();
      if (!reset) return 'expired';
      await inSession(User.updateOne({ _id: reset.user_id }, { $set: { password_hash: await hashPassword(password) } }), session).exec();
      await inSession(PasswordReset.updateMany({ user_id: reset.user_id }, { $set: { used: true } }), session).exec();
      await inSession(RefreshToken.deleteMany({ user_id: reset.user_id }), session).exec();
      return 'ok';
    });
    if (outcome === 'expired') return res.status(400).json({ error: 'This reset link is invalid, already used, or has expired. Please request a new one.' });
    res.json({ message: 'Password updated. You can now sign in.' });
  } catch (err) { next(err); }
});

app.get('/api/state', requireUser, async (req, res, next) => {
  try {
    const userId = req.user._id;
    const [progress, answers, payouts] = await Promise.all([
      UserSurvey.find({ user_id: userId }).select('survey_id unlocked').lean(),
      UserAnswer.find({ user_id: userId }).select('survey_id question_id').lean(),
      Withdrawal.find({ user_id: userId }).select('amount created_at status').sort({ _id: -1 }).lean(),
    ]);
    const state = { balance: Number(req.user.balance), totalEarned: Number(req.user.total_earned), surveys: {}, withdrawals: payouts.map(w => ({ amount: Number(w.amount), at: w.created_at, status: w.status })) };
    for (const row of progress) state.surveys[row.survey_id] = { unlocked: !!row.unlocked, completedQuestions: [] };
    for (const row of answers) { (state.surveys[row.survey_id] ||= { unlocked: true, completedQuestions: [] }).completedQuestions.push(row.question_id); }
    res.json({ user: publicUser(req.user), state });
  } catch (err) { next(err); }
});

app.post('/api/answers', requireUser, async (req, res, next) => {
  try {
    const { surveyId, questionId, answerIndex } = req.body;
    const survey = SURVEY_SETS.find(s => s.id === surveyId); const question = survey?.questions.find(q => q.id === questionId);
    if (!question || !Number.isInteger(answerIndex) || answerIndex < 0 || answerIndex >= question.options.length) return res.status(400).json({ error: 'Invalid survey answer.' });
    const userId = req.user._id;
    const outcome = await runInTransaction(async session => {
      const already = await inSession(UserAnswer.findOne({ user_id: userId, survey_id: surveyId, question_id: questionId }), session).select('_id').lean();
      if (already) return 'duplicate';
      const progress = await inSession(UserSurvey.findOne({ user_id: userId, survey_id: surveyId }), session).select('unlocked').lean();
      if (survey.unlockFee > 0 && !progress?.unlocked) return 'locked';
      // upsert creates the progress row on the first answer and updates it afterwards.
      await inSession(
        UserSurvey.updateOne(
          { user_id: userId, survey_id: surveyId },
          { $set: { unlocked: true }, $setOnInsert: { created_at: new Date(), completed_at: null } },
          { upsert: true },
        ),
        session,
      ).exec();
      try {
        // save() is used rather than create() so the write is awaited inside this
        // transaction and a duplicate key is catchable here.
        await new UserAnswer({ user_id: userId, survey_id: surveyId, question_id: questionId, answer_index: answerIndex, reward: survey.rewardPerQuestion }).save({ session });
      } catch (err) {
        if (isDuplicateKeyError(err)) return 'duplicate';
        throw err;
      }
      await inSession(User.updateOne({ _id: userId }, { $inc: { balance: survey.rewardPerQuestion, total_earned: survey.rewardPerQuestion } }), session).exec();
      return 'ok';
    });
    if (outcome === 'duplicate') return res.status(409).json({ error: 'This question was already answered.' });
    if (outcome === 'locked') return res.status(403).json({ error: 'Unlock this survey first.' });
    res.json({ reward: survey.rewardPerQuestion });
  } catch (err) { next(err); }
});

app.post('/api/surveys/:id/unlock', requireUser, async (req, res, next) => {
  try {
    const survey = SURVEY_SETS.find(s => s.id === req.params.id);
    if (!survey) return res.status(404).json({ error: 'Survey not found.' });
    // Payment verification is a separate provider integration; never trust pasted SMS text as proof of payment.
    if (survey.unlockFee > 0) return res.status(501).json({ error: 'Paid survey unlocks require a verified payment provider.' });
    await UserSurvey.updateOne(
      { user_id: req.user._id, survey_id: survey.id },
      { $set: { unlocked: true }, $setOnInsert: { created_at: new Date(), completed_at: null } },
      { upsert: true },
    );
    res.json({ ok: true });
  } catch (err) { next(err); }
});

app.post('/api/withdrawals', requireUser, async (req, res, next) => {
  try {
    const name = String(req.body.name || '').trim(), phone = String(req.body.phone || '').replace(/\s/g, ''), amount = Number(req.body.amount);
    if (!name || name.length > 200 || !/^(?:07|01)\d{8}$/.test(phone) || !Number.isFinite(amount) || amount < 500) return res.status(400).json({ error: 'Enter valid payout details and at least KSh 500.' });
    const userId = req.user._id;
    const outcome = await runInTransaction(async session => {
      // The balance guard lives in the filter, so concurrent payouts cannot overdraw the wallet.
      const debited = await inSession(
        User.updateOne(
          { _id: userId, balance: { $gte: amount } },
          { $inc: { balance: -amount } },
        ),
        session,
      ).exec();
      if (!debited.modifiedCount) return 'insufficient';
      await new Withdrawal({ user_id: userId, recipient_name: name, phone, amount, status: 'pending' }).save({ session });
      return 'ok';
    });
    if (outcome === 'insufficient') return res.status(400).json({ error: 'Insufficient balance.' });
    res.status(201).json({ ok: true });
  } catch (err) {
    if (isValidationError(err)) return res.status(400).json({ error: 'Enter valid payout details and at least KSh 500.' });
    next(err);
  }
});

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../dist');
app.use(express.static(root));
app.get('/{*path}', (_req, res) => res.sendFile(path.join(root, 'index.html')));
app.use((err, _req, res, _next) => { console.error(err); res.status(500).json({ error: 'A server error occurred.' }); });

// Password reset email is only useful if it can actually reach the recipient, so surface
// any configuration that limits delivery at startup rather than failing silently later.
if (!process.env.SMTP_HOST) {
  console.warn('Email: SMTP is not configured, so password reset links cannot be sent.');
} else if (process.env.SMTP_FROM?.includes('onboarding@resend.dev')) {
  console.warn('Email: SMTP_FROM is onboarding@resend.dev, which Resend only delivers to the Resend account owner address. Add and verify a domain at resend.com/domains, then set SMTP_FROM to an address on that domain to email other users.');
}

await connectDatabase();
await ping();
app.listen(port, () => console.log(`NGO Surveys listening on port ${port}`));

// Log background failures instead of letting them terminate the process, so one
// bad request cannot take the API offline.
process.on('unhandledRejection', reason => console.error('Unhandled rejection:', reason));
process.on('uncaughtException', err => console.error('Uncaught exception:', err));

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => { closeDatabase().finally(() => process.exit(0)); });
}
