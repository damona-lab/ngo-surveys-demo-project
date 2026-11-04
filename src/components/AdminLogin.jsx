import { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
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
      if (user.role !== 'admin') { await logout(); setError('This account does not have administrator access.'); }
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  };
  return <main className="admin-login-wrap"><form className="admin-login" onSubmit={submit}>
    <div className="admin-mark"><ShieldCheck size={23} /></div>
    <span className="admin-kicker">NGO SURVEYS · ADMIN</span>
    <h1>Admin sign in</h1><p>Sign in with your administrator account to manage the website.</p>
    <label>Email<input type="email" autoComplete="username" value={email} onChange={e => setEmail(e.target.value)} required /></label>
    <label>Password<input type="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} required /></label>
    {error && <div className="admin-error">{error}</div>}
    <button className="admin-primary" disabled={busy}>{busy ? 'Signing in…' : 'Sign in securely'}</button>
    <a href="/">Return to surveys</a>
  </form></main>;
}
