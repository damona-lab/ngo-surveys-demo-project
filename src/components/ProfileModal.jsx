import { useState } from 'react';
import { X, User, Mail, Phone } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function ProfileModal({ open, onClose }) {
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '', phone: user?.phone || '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  if (!open || !user) return null;

  const update = e => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async e => {
    e.preventDefault();
    setError('');
    setSaved(false);
    setLoading(true);
    try {
      await updateProfile(form);
      setSaved(true);
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
        <h2>My profile</h2>
        <p className="modal-copy">View and update your account details.</p>
        <form onSubmit={submit}>
          <label>Full name<input name="name" value={form.name} onChange={update} minLength="2" maxLength="120" required /></label>
          <label>Email<input name="email" value={form.email} onChange={update} type="email" required /></label>
          <label>Phone number<input name="phone" value={form.phone} onChange={update} pattern="^(?:07|01)\d{8}$" required /></label>
          {error && <p className="form-error">{error}</p>}
          {saved && <p className="form-success">Profile updated.</p>}
          <button className="primary-button full" disabled={loading}>{loading ? 'Saving…' : 'Save changes'}</button>
        </form>
      </section>
    </div>
  );
}
