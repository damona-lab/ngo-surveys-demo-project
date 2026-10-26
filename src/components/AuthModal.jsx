import { useState } from 'react';
import { X, Mail, Lock, User as UserIcon, LogIn, UserPlus, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function AuthModal({ open, onClose }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signup, login, setError: setAuthError } = useAuth();

  if (!open) return null;

  const update = e => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') await login(form.email, form.password);
      else await signup(form.name, form.email, form.phone, form.password);
      onClose();
      setForm({ name: '', email: '', password: '' });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop auth-backdrop" role="dialog" aria-modal="true">
      <section className="modal auth-modal">
        <button className="icon-close" onClick={onClose} aria-label="Close"><X /></button>
        <div className="auth-tabs">
          <button className={mode === 'login' ? 'active' : ''} onClick={() => { setMode('login'); setError(''); }}>Sign in</button>
          <button className={mode === 'signup' ? 'active' : ''} onClick={() => { setMode('signup'); setError(''); }}>Create account</button>
        </div>
        <h2>{mode === 'login' ? 'Welcome back' : 'Create your account'}</h2>
        <p className="modal-copy">{mode === 'login' ? 'Sign in to continue earning rewards.' : 'Join NGO Surveys and start earning for your perspective.'}</p>
        <form onSubmit={submit}>
          {mode === 'signup' && (
            <label>Full name<input name="name" value={form.name} onChange={update} placeholder="e.g. Amina Wanjiku" minLength="2" maxLength="120" required /></label>
          )}
          {mode === 'signup' && (
            <label>Phone number<input name="phone" value={form.phone} onChange={update} placeholder="07XXXXXXXX" pattern="^(?:07|01)\d{8}$" required /></label>
          )}
          <label>Email<input name="email" value={form.email} onChange={update} type="email" placeholder="you@example.com" required /></label>
          <label>Password<input name="password" value={form.password} onChange={update} type="password" placeholder={mode === 'signup' ? 'At least 10 characters' : 'Your password'} minLength="10" required /></label>
          {error && <p className="form-error"><AlertCircle size={15} />{error}</p>}
          <button className="primary-button full" disabled={loading}>
            {loading ? 'Please wait…' : mode === 'login' ? <><LogIn size={16} /> Sign in</> : <><UserPlus size={16} /> Create account</>}
          </button>
        </form>
        <p className="auth-switch">
          {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
          <button onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }}>
            {mode === 'login' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </section>
    </div>
  );
}