import { useState } from 'react';
import { X, ShieldCheck, ClipboardCheck, AlertCircle, Copy, Check } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function PaymentModal({ survey, onClose, onUnlock }) {
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const verify = async () => {
    const code = /\b[A-Z]{2}\d{8}\b/i.test(message);
    const amount = new RegExp(`(?:Ksh|KES)\\s*${survey.unlockFee}(?:\\.00)?\\b`, 'i').test(message);
    if (!code || !amount) return setError(`Enter the format with a code (e.g. QK12345678) and Ksh ${survey.unlockFee}.`);
    setLoading(true);
    setError('');
    try {
      await onUnlock(survey.id);
      onClose();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const copyAccount = () => {
    if (!navigator.clipboard) return;
    navigator.clipboard.writeText('1500185563003').then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <section className="modal payment-modal">
        <button className="icon-close" onClick={onClose} aria-label="Close"><X /></button>
        <div className="modal-icon teal"><ShieldCheck /></div>
        <span className="eyebrow">SECURE PAYMENT</span>
        <h2>Unlock {survey.title}</h2>
        <p className="modal-copy">Complete the M-Pesa payment below to unlock this survey and start earning rewards.</p>
        <div className="payment-instructions">
          <ClipboardCheck size={20} />
          <div>
            <strong>Payment reference</strong>
            <p>Go to M-Pesa → Lipa Na M-Pesa → Paybill</p>
            <p>Business number <strong>247247</strong> · Account number (Payment reference) <strong>1500185563003</strong></p>
            <p>Enter amount <strong>Ksh {survey.unlockFee}</strong>, then confirm PIN</p>
            <code>QK12345678 Confirmed. Ksh {survey.unlockFee}.00 PAID</code>
          </div>
        </div>
        <div className="account-copy-row">
          <span>Account number</span>
          <strong>1500185563003</strong>
          <button type="button" className="copy-account-button" onClick={copyAccount} aria-label="Copy account number to clipboard" title="Copy account number to clipboard">
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? 'Copied' : 'Copy account number to clipboard'}
          </button>
        </div>
        <label>Paste your confirmation message here
          <textarea value={message} onChange={e => { setMessage(e.target.value); setError(''); }} placeholder={`Example: QK12345678 Confirmed. Ksh ${survey.unlockFee}.00 PAID`} />
        </label>
        {error && <p className="form-error"><AlertCircle size={15} />{error}</p>}
        <button className="primary-button full" disabled={loading} onClick={verify}>{loading ? 'Verifying…' : 'Verify payment & unlock'}</button>
      </section>
    </div>
  );
}