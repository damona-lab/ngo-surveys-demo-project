import { useState } from 'react';
import { X, ShieldCheck, ClipboardCheck, AlertCircle } from 'lucide-react';

export default function PaymentModal({ survey, onClose, onUnlock }) {
  const [message, setMessage] = useState(''); const [error, setError] = useState('');
  const verify = () => {
    const code = /\b[A-Z]{2}\d{8}\b/i.test(message);
    const amount = new RegExp(`(?:Ksh|KES)\\s*${survey.unlockFee}(?:\\.00)?\\b`, 'i').test(message);
    if (!code || !amount) return setError(`Enter the format with a code (e.g. QK12345678) and Ksh ${survey.unlockFee}.`);
    onUnlock(survey.id); onClose();
  };
  return <div className="modal-backdrop" role="dialog" aria-modal="true"><section className="modal payment-modal"><button className="icon-close" onClick={onClose} aria-label="Close"><X /></button><div className="modal-icon teal"><ShieldCheck /></div><span className="eyebrow">SECURE PAYMENT</span><h2>Unlock {survey.title}</h2><p className="modal-copy">Complete the payment below to unlock this survey and start earning rewards.</p><div className="payment-instructions"><ClipboardCheck size={20} /><div><strong>Payment reference</strong><p>Pay to Till 8934120 · “NGO Surveys Services”</p><code>QK12345678 Confirmed. Ksh {survey.unlockFee}.00 PAID</code></div></div><label>Paste your confirmation message here<textarea value={message} onChange={e => { setMessage(e.target.value); setError(''); }} placeholder={`Example: QK12345678 Confirmed. Ksh ${survey.unlockFee}.00 PAID`} /></label>{error && <p className="form-error"><AlertCircle size={15} />{error}</p>}<button className="primary-button full" onClick={verify}>Verify payment & unlock</button></section></div>;
}
