import { useState } from 'react';
import { ShieldCheck, Mail, Lock, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import '../admin.css';

export default function AdminLogin() {
  const { login, logout } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async event => {
    event.preventDefault(); setBusy(true); setError('');
    try {
      const user = await login(email, password);
      if (user.role !== 'admin') { await logout(); setError('This account does not have administrator access.'); setBusy(false); return; }
      return;
    } catch (err) { setError(err.message); setBusy(false); }
  };
  return <main className="admin-login-page">
    <div className="admin-login-glow" aria-hidden="true" />
    <section className="admin-login-card">
      <header className="admin-login-head">
        <span className="admin-login-badge"><ShieldCheck size={22} /></span>
        <span className="admin-kicker">NGO SURVEYS · SECURE CONSOLE</span>
        <h1>Administrator sign in</h1>
        <p>Use your admin credentials to manage surveys, users, payouts, and site content.</p>
      </header>
      <form className="admin-login-form" onSubmit={submit}>
        <label>
          <span>Email address</span>
          <div className="admin-input"><Mail size={17} /><input type="email" autoComplete="username" placeholder="admin@example.com" value={email} onChange={e => setEmail(e.target.value)} required /></div>
        </label>
        <label>
          <span>Password</span>
          <div className="admin-input"><Lock size={17} /><input type="password" autoComplete="current-password" placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)} required /></div>
        </label>
        {error && <div className="admin-error" role="alert">{error}</div>}
        <button className="admin-primary admin-login-submit" disabled={busy}>{busy ? 'Signing in…' : 'Sign in to admin'}</button>
      </form>
      <footer className="admin-login-foot"><a href="/"><ArrowLeft size={15} /> Return to website</a></footer>
    </section>
  </main>;
}
