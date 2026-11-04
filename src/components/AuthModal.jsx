import { useState } from 'react';
import { X, Mail, Lock, User as UserIcon, LogIn, UserPlus, AlertCircle, Phone, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function AuthModal({ open, onClose }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { signup, login } = useAuth();

  if (!open) return null;

  const update = e => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async e => {
    e.preventDefault();
    if (mode === 'signup' && form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') await login(form.email, form.password);
      else await signup(form.name, form.email, form.phone, form.password, form.confirmPassword);
      onClose();
      setForm({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (next) => {
    setMode(next);
    setError('');
    setForm({ name: '', email: '', phone: '', password: '' });
  };

  return (
    <div className="auth-backdrop" role="dialog" aria-modal="true">
      <div className={`auth-glass-shell auth-glass-shell--${mode}`}>
        {/* Close button */}
        <button className="auth-close" onClick={onClose} aria-label="Close">
          <X size={20} />
        </button>

        {/* Sliding panels wrapper */}
        <div className="auth-panels">
          <div
            className={`auth-panel auth-panel-login ${mode === 'login' ? 'active' : ''}`}
          >
            <div className="auth-panel-inner">
              <div className="auth-logo">
                <div className="auth-logo-mark">
                  <img className="auth-logo-image" src="/logo-mark.svg" alt="" aria-hidden="true" />
                </div>
                <div>
                  <h3>NGO Surveys</h3>
                  <small>Rewarding your perspective</small>
                </div>
              </div>

              <h2>Welcome back</h2>
              <p className="auth-copy">Sign in to continue earning rewards for your opinions.</p>

              <form onSubmit={submit} className="auth-form">
                <label className="auth-field">
                  <span>Email</span>
                  <div className="auth-input-wrap">
                    <Mail size={17} />
                    <input name="email" value={form.email} onChange={update} type="email" placeholder="you@example.com" required />
                  </div>
                </label>
                <label className="auth-field">
                  <span>Password</span>
                  <div className="auth-input-wrap">
                    <Lock size={17} />
                    <input name="password" value={form.password} onChange={update} type={showLoginPassword ? "text" : "password"} placeholder="Your password" autoComplete="current-password" required />
                    <button type="button" className="auth-password-toggle" onClick={() => setShowLoginPassword(value => !value)} aria-label={showLoginPassword ? "Hide password" : "Show password"} aria-pressed={showLoginPassword}>
                      {showLoginPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                </label>

                {error && <p className="auth-error"><AlertCircle size={15} />{error}</p>}

                <button type="submit" className="auth-submit" disabled={loading}>
                  {loading ? 'Please waitâ€¦' : <><LogIn size={18} /> Sign in</>}
                </button>
              </form>

              <p className="auth-switch-text">
                Don't have an account?{' '}
                <button onClick={() => switchMode('signup')}>Create account</button>
              </p>
            </div>
          </div>

          <div
            className={`auth-panel auth-panel-signup ${mode === 'signup' ? 'active' : ''}`}
          >
            <div className="auth-panel-inner">
              <div className="auth-logo">
                <div className="auth-logo-mark">
                  <img className="auth-logo-image" src="/logo-mark.svg" alt="" aria-hidden="true" />
                </div>
                <div>
                  <h3>NGO Surveys</h3>
                  <small>Rewarding your perspective</small>
                </div>
              </div>

              <h2>Create your account</h2>
              <p className="auth-copy">Join NGO Surveys and start earning for your perspective.</p>

              <form onSubmit={submit} className="auth-form">
                <label className="auth-field">
                  <span>Full name</span>
                  <div className="auth-input-wrap">
                    <UserIcon size={17} />
                    <input name="name" value={form.name} onChange={update} placeholder="e.g. Amina Wanjiku" minLength="2" maxLength="120" required />
                  </div>
                </label>
                <label className="auth-field">
                  <span>Phone number</span>
                  <div className="auth-input-wrap">
                    <Phone size={17} />
                    <input name="phone" value={form.phone} onChange={update} placeholder="07XXXXXXXX" pattern="^(?:07|01)\d{8}$" required />
                  </div>
                </label>
                <label className="auth-field">
                  <span>Email</span>
                  <div className="auth-input-wrap">
                    <Mail size={17} />
                    <input name="email" value={form.email} onChange={update} type="email" placeholder="you@example.com" required />
                  </div>
                </label>
<label className="auth-field">
                  <span>Password (minimum 8 characters)</span>
                  <div className="auth-input-wrap">
                    <Lock size={17} />
                    <input name="password" value={form.password} onChange={update} type={showSignupPassword ? "text" : "password"} placeholder="At least 8 characters" minLength={8} maxLength={72} autoComplete="new-password" required />
                    <button type="button" className="auth-password-toggle" onClick={() => setShowSignupPassword(value => !value)} aria-label={showSignupPassword ? "Hide password" : "Show password"} aria-pressed={showSignupPassword}>
                      {showSignupPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                </label>
                <label className="auth-field">
                  <span>Confirm password</span>
                  <div className="auth-input-wrap">
                    <Lock size={17} />
                    <input name="confirmPassword" value={form.confirmPassword} onChange={update} type={showConfirmPassword ? "text" : "password"} placeholder="Repeat your password" minLength={8} maxLength={72} autoComplete="new-password" required />
                    <button type="button" className="auth-password-toggle" onClick={() => setShowConfirmPassword(value => !value)} aria-label={showConfirmPassword ? "Hide password" : "Show password"} aria-pressed={showConfirmPassword}>
                      {showConfirmPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                </label>

                {error && <p className="auth-error"><AlertCircle size={15} />{error}</p>}

                <button type="submit" className="auth-submit" disabled={loading}>
                  {loading ? 'Please waitâ€¦' : <><UserPlus size={18} /> Create account</>}
                </button>
              </form>

              <p className="auth-switch-text">
                Already have an account?{' '}
                <button onClick={() => switchMode('login')}>Sign in</button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}