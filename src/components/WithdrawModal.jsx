import { useState } from 'react';
import { X, Landmark, LoaderCircle, CheckCircle2, AlertCircle } from 'lucide-react';

export default function WithdrawModal({ balance, onWithdraw, onClose }) {
  const [form, setForm] = useState({ name: '', phone: '', amount: '' });
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);
  const [complete, setComplete] = useState(false);

  const update = e => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = e => {
    e.preventDefault();
    const amount = Number(form.amount);
    if (!form.name.trim()) return setError('Enter a name for this request.');
    if (!/^(?:07|01)\d{8}$/.test(form.phone.replace(/\s/g, ''))) return setError('Use a valid Kenyan mobile format: 07XXXXXXXX or 01XXXXXXXX.');
    if (amount < 500 || amount > balance) return setError(`Enter an amount from KSh 500 to KSh ${balance.toFixed(2)}.`);
    setError('');
    setProcessing(true);
    onWithdraw(amount, form.name.trim(), form.phone.replace(/\s/g, ''));
    // onWithdraw now resolves after the API call; show completion state
    setProcessing(false);
    setComplete(true);
  };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <section className="modal withdraw-modal">
        <button className="icon-close" onClick={onClose}><X /></button>
        {complete ? (
          <div className="success-state">
            <div className="modal-icon green"><CheckCircle2 /></div>
            <span className="eyebrow">COMPLETE</span>
            <h2>Request recorded</h2>
            <p>KSh {Number(form.amount).toFixed(2)} will be sent to {form.phone} within 24 hours.</p>
            <button className="primary-button" onClick={onClose}>Close</button>
          </div>
        ) : (
          <>
            <div className="modal-icon gold"><Landmark /></div>
            <span className="eyebrow">CASH-OUT</span>
            <h2>Withdraw cash</h2>
            <p className="modal-copy">Minimum withdrawal: KSh 500. Funds are sent directly to your M-Pesa number.</p>
            <form onSubmit={submit}>
              <label>Full name<input name="name" value={form.name} onChange={update} placeholder="e.g. Amina Wanjiku" /></label>
              <label>M-Pesa phone number<input name="phone" value={form.phone} onChange={update} placeholder="07XXXXXXXX" inputMode="numeric" /></label>
              <label>Amount (KSh)<input name="amount" value={form.amount} onChange={update} placeholder={`Available: ${balance.toFixed(2)}`} type="number" min="500" max={balance} /></label>
              {error && <p className="form-error"><AlertCircle size={15} />{error}</p>}
              <button className="primary-button full" disabled={processing || balance < 500}>{processing ? <><LoaderCircle className="spin" size={18} /> Processing…</> : 'Confirm withdrawal'}</button>
            </form>
          </>
        )}
      </section>
    </div>
  );
}