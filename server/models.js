import mongoose from 'mongoose';

const { Schema } = mongoose;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^(?:07|01)\d{8}$/;

// Money is rounded to two decimals on every write so repeated rewards and payouts
// cannot accumulate floating point drift in the wallet.
const money = (fallback = 0) => ({
  type: Number,
  required: true,
  min: 0,
  default: fallback,
  set: value => (value === undefined || value === null ? value : Math.round(Number(value) * 100) / 100),
});

const userSchema = new Schema({
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 120 },
  email: { type: String, required: true, trim: true, lowercase: true, maxlength: 255, match: EMAIL_PATTERN, index: { unique: true, name: 'users_email_unique' } },
  phone: { type: String, required: true, trim: true, match: PHONE_PATTERN },
  // bcrypt hashes never leave the database unless a query asks for them explicitly.
  password_hash: { type: String, required: true, select: false },
  role: { type: String, enum: ['user', 'admin'], default: 'user', index: true },
  balance: money(),
  total_earned: money(),
  status: { type: String, enum: ['active', 'suspended'], default: 'active', index: true },
}, {
  collection: 'users',
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  versionKey: false,
  toJSON: { transform: (_doc, ret) => { delete ret.password_hash; return ret; } },
});

const questionSchema = new Schema({
  id: { type: String, required: true, trim: true, maxlength: 60 },
  sort_order: { type: Number, required: true, min: 1 },
  text: { type: String, required: true, trim: true, maxlength: 2000 },
  options: { type: [String], required: true, validate: { validator: value => value.length >= 2, message: 'A question needs at least two options.' } },
}, { _id: false });

const surveySchema = new Schema({
  // The survey id is the natural key used by the API, so it is the document _id.
  _id: { type: String, required: true, trim: true, maxlength: 40 },
  title: { type: String, required: true, trim: true, maxlength: 200 },
  description: { type: String, trim: true, maxlength: 500, default: '' },
  tier: { type: String, required: true, enum: ['free', 'premium', 'premium_plus', 'elite'], index: true },
  unlock_fee: money(),
  reward_per_question: money(),
  questions: { type: [questionSchema], default: [] },
  is_active: { type: Boolean, default: true, index: true },
  created_at: { type: Date, default: Date.now },
}, { collection: 'surveys', versionKey: false });

const userSurveySchema = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  survey_id: { type: String, required: true, trim: true, maxlength: 40 },
  unlocked: { type: Boolean, default: false },
  completed_at: { type: Date, default: null },
}, {
  collection: 'user_surveys',
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  versionKey: false,
});
userSurveySchema.index({ user_id: 1, survey_id: 1 }, { unique: true, name: 'user_surveys_unique' });

const userAnswerSchema = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  survey_id: { type: String, required: true, trim: true, maxlength: 40 },
  question_id: { type: String, required: true, trim: true, maxlength: 60 },
  answer_index: { type: Number, required: true, min: 0 },
  reward: money(),
  answered_at: { type: Date, default: Date.now },
}, { collection: 'user_answers', versionKey: false });
userAnswerSchema.index({ user_id: 1, survey_id: 1, question_id: 1 }, { unique: true, name: 'user_answers_unique' });
userAnswerSchema.index({ user_id: 1, survey_id: 1 }, { name: 'user_answers_lookup' });

const withdrawalSchema = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  recipient_name: { type: String, required: true, trim: true, maxlength: 200 },
  phone: { type: String, required: true, trim: true, match: PHONE_PATTERN },
  amount: money(),
  status: { type: String, enum: ['pending', 'processing', 'paid', 'failed'], default: 'pending' },
  created_at: { type: Date, default: Date.now },
  processed_at: { type: Date, default: null },
}, { collection: 'withdrawals', versionKey: false });

const passwordResetSchema = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  token: { type: String, required: true, unique: true, match: /^[a-f0-9]{64}$/ },
  used: { type: Boolean, default: false },
  expires_at: { type: Date, required: true },
  created_at: { type: Date, default: Date.now },
}, { collection: 'password_resets', versionKey: false });

const refreshTokenSchema = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  token_hash: { type: String, required: true, unique: true, maxlength: 128 },
  user_agent: { type: String, default: null, maxlength: 500 },
  expires_at: { type: Date, required: true },
  created_at: { type: Date, default: Date.now },
}, { collection: 'refresh_tokens', versionKey: false });

const activitySchema = new Schema({
  type: { type: String, required: true, trim: true, maxlength: 80, index: true },
  user_id: { type: Schema.Types.ObjectId, ref: 'User', default: null, index: true },
  email: { type: String, trim: true, lowercase: true, maxlength: 255, default: '' },
  details: { type: Schema.Types.Mixed, default: {} },
  created_at: { type: Date, default: Date.now, index: true },
}, { collection: 'activity_events', versionKey: false });
activitySchema.index({ created_at: -1 });

const siteSettingsSchema = new Schema({
  key: { type: String, default: 'site', unique: true },
  hero_title: { type: String, trim: true, maxlength: 180, default: 'Your voice can help shape impact.' },
  hero_copy: { type: String, trim: true, maxlength: 500, default: 'Explore community research surveys, record your opinions, and earn rewards for sharing your perspective.' },
  notice: { type: String, trim: true, maxlength: 500, default: '' },
}, { collection: 'site_settings', versionKey: false });

export const User = mongoose.models.User || mongoose.model('User', userSchema);
export const Survey = mongoose.models.Survey || mongoose.model('Survey', surveySchema);
export const UserSurvey = mongoose.models.UserSurvey || mongoose.model('UserSurvey', userSurveySchema);
export const UserAnswer = mongoose.models.UserAnswer || mongoose.model('UserAnswer', userAnswerSchema);
export const Withdrawal = mongoose.models.Withdrawal || mongoose.model('Withdrawal', withdrawalSchema);
export const PasswordReset = mongoose.models.PasswordReset || mongoose.model('PasswordReset', passwordResetSchema);
export const RefreshToken = mongoose.models.RefreshToken || mongoose.model('RefreshToken', refreshTokenSchema);
export const ActivityEvent = mongoose.models.ActivityEvent || mongoose.model('ActivityEvent', activitySchema);
export const SiteSetting = mongoose.models.SiteSetting || mongoose.model('SiteSetting', siteSettingsSchema);

export const MODELS = [User, Survey, UserSurvey, UserAnswer, Withdrawal, PasswordReset, RefreshToken, ActivityEvent, SiteSetting];
