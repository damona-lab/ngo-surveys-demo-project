import { useEffect, useState } from 'react';
import { Activity, BarChart3, BookOpen, Globe2, LogOut, Plus, Save, ShieldCheck, Users, Wallet, X } from 'lucide-react';
import API from '../api';
import { TIER_DETAILS, SURVEY_TIERS } from '../surveysData';
import '../admin.css';

const tabs = [
  ['overview', 'Overview', BarChart3], ['surveys', 'Surveys', BookOpen], ['users', 'Users', Users],
  ['withdrawals', 'Withdrawals', Wallet], ['activity', 'Activity log', Activity], ['website', 'Website', Globe2],
];
const blankSurvey = () => ({ title: '', description: '', tier: 'free', unlockFee: 0, rewardPerQuestion: 20, questions: [{ text: '', options: ['', '', '', ''] }] });
const tiers = Object.entries(TIER_DETAILS);
const formatDate = value => value ? new Date(value).toLocaleString() : '—';

export default function AdminDashboard({ user, onLogout }) {
  const [tab, setTab] = useState('overview');
  const [overview, setOverview] = useState(null);
  const [surveys, setSurveys] = useState([]);
  const [users, setUsers] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [events, setEvents] = useState([]);
  const [settings, setSettings] = useState({ heroTitle: '', heroCopy: '', notice: '' });
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(blankSurvey);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const load = async activeTab => {
    try {
      if (activeTab === 'overview') setOverview(await API.adminOverview());
      if (activeTab === 'surveys') setSurveys((await API.adminSurveys()).surveys);
      if (activeTab === 'users') setUsers((await API.adminUsers()).users);
      if (activeTab === 'withdrawals') setWithdrawals((await API.adminWithdrawals()).withdrawals);
      if (activeTab === 'activity') setEvents((await API.adminEvents()).events);
      if (activeTab === 'website') setSettings((await API.siteSettings()).settings);
    } catch (err) { setError(err.message); }
  };
  useEffect(() => { load(tab); }, [tab]);

  const run = async action => {
    setBusy(true); setError(''); setNotice('');
    try { await action(); await load(tab); setNotice('Changes saved.'); }
    catch (err) { setError(err.message); }
    finally { setBusy(false); }
  };
  const beginEdit = survey => {
    setEditing(survey.id);
    setForm({ title: survey.title, description: survey.description || '', tier: survey.tier, unlockFee: survey.unlockFee, rewardPerQuestion: survey.rewardPerQuestion, questions: survey.questions.map(q => ({ id: q.id, text: q.text, options: [...q.options] })) });
  };
  const saveSurvey = async event => {
    event.preventDefault();
    await run(async () => {
      if (editing) await API.updateSurvey(editing, form); else await API.createSurvey(form);
      setEditing(null); setForm(blankSurvey());
    });
  };
  const updateQuestion = (index, key, value) => setForm(old => ({ ...old, questions: old.questions.map((q, i) => i === index ? { ...q, [key]: value } : q) }));

  return <div className="admin-shell">
    <aside className="admin-sidebar">
      <a className="admin-brand" href="/"><span className="admin-mark"><ShieldCheck size={22} /></span><span>NGO Surveys<small>Admin console</small></span></a>
      <nav>{tabs.map(([id, label, Icon]) => <button key={id} className={tab === id ? 'active' : ''} onClick={() => { setTab(id); setError(''); setNotice(''); }}><Icon size={18} />{label}</button>)}</nav>
      <div className="admin-profile"><span className="admin-avatar">{user.name?.slice(0, 1).toUpperCase()}</span><span><strong>{user.name}</strong><small>{user.email}</small></span><button title="Sign out" onClick={onLogout}><LogOut size={17} /></button></div>
    </aside>
    <main className="admin-main">
      <header className="admin-header"><div><span className="admin-kicker">MANAGEMENT CONSOLE</span><h1>{tabs.find(item => item[0] === tab)?.[1]}</h1></div><a href="/?preview=1" target="_blank" rel="noreferrer">View website ↗</a></header>
      {error && <div className="admin-banner error">{error}</div>}{notice && <div className="admin-banner success">{notice}</div>}

      {tab === 'overview' && <Overview data={overview} />}
      {tab === 'surveys' && <section className="admin-card">
        <div className="admin-card-head"><div><h2>Survey management</h2><p>Create, edit, or archive surveys across all four tiers.</p></div><button className="admin-primary compact" onClick={() => { setEditing(null); setForm(blankSurvey()); }}><Plus size={17} /> New survey</button></div>
        <div className="admin-table-wrap"><table><thead><tr><th>Survey</th><th>Tier</th><th>Unlock fee</th><th>Reward / answer</th><th>Status</th><th></th></tr></thead><tbody>{surveys.map(s => <tr key={s.id}><td><strong>{s.title}</strong><small>{s.questions.length} questions</small></td><td>{TIER_DETAILS[s.tier]?.label || s.tier}</td><td>KSh {s.unlockFee}</td><td>KSh {Number(s.rewardPerQuestion).toFixed(2)}</td><td><span className={`admin-status ${s.active ? 'active' : 'inactive'}`}>{s.active ? 'Active' : 'Archived'}</span></td><td className="actions"><button onClick={() => beginEdit(s)}>Edit</button>{s.active && <button className="danger-link" onClick={() => { if (window.confirm(`Archive “${s.title}”?`)) run(() => API.archiveSurvey(s.id)); }}>Archive</button>}</td></tr>)}</tbody></table></div>
        {(editing || form.title === '') && <form className="admin-form" onSubmit={saveSurvey}>
          <div className="admin-form-title"><h3>{editing ? 'Edit survey' : 'Add a survey'}</h3><button type="button" onClick={() => { setEditing(null); setForm(blankSurvey()); }} aria-label="Close form"><X size={18} /></button></div>
          <div className="admin-form-grid"><label>Survey title<input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required maxLength={200} /></label><label>Tier<select value={form.tier} onChange={e => setForm({ ...form, tier: e.target.value })}>{tiers.map(([value, details]) => <option key={value} value={value}>{details.label}</option>)}</select></label><label>Description<input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} maxLength={500} /></label><label>Unlock fee (KSh)<input type="number" min="0" value={form.unlockFee} onChange={e => setForm({ ...form, unlockFee: Number(e.target.value) })} required /></label><label>Reward per answer (KSh)<input type="number" min="0" step="0.01" value={form.rewardPerQuestion} onChange={e => setForm({ ...form, rewardPerQuestion: Number(e.target.value) })} required /></label></div>
          {form.questions.map((q, i) => <fieldset className="admin-question" key={i}><legend>Question {i + 1}</legend><label>Question<input value={q.text} onChange={e => updateQuestion(i, 'text', e.target.value)} required maxLength={2000} /></label><label>Answer options <small>Separate each option with a new line (2–8 options)</small><textarea value={q.options.join('\n')} onChange={e => updateQuestion(i, 'options', e.target.value.split('\n'))} required /></label><button className="danger-link" type="button" disabled={form.questions.length < 2} onClick={() => setForm(old => ({ ...old, questions: old.questions.filter((_, index) => index !== i) }))}>Remove question</button></fieldset>)}
          <div className="admin-form-actions"><button className="admin-secondary" type="button" onClick={() => setForm(old => ({ ...old, questions: [...old.questions, { text: '', options: ['', '', '', ''] }] }))}><Plus size={16} /> Add question</button><button className="admin-primary" disabled={busy}><Save size={16} /> {busy ? 'Saving…' : 'Save survey'}</button></div>
        </form>}
      </section>}

      {tab === 'users' && <section className="admin-card"><div className="admin-card-head"><div><h2>Accounts</h2><p>Latest 250 accounts, wallet balances, and account status.</p></div></div><DataTable heads={['Name', 'Email', 'Phone', 'Role', 'Wallet', 'Status', 'Joined']} rows={users.map(u => [<strong>{u.name}</strong>, u.email, u.phone, u.role, `KSh ${u.balance.toFixed(2)}`, <button className={`admin-status-button ${u.status}`} disabled={u.role === 'admin'} onClick={() => run(() => API.setUserStatus(u.id, u.status === 'active' ? 'suspended' : 'active'))}>{u.status === 'active' ? 'Active' : 'Suspended'}</button>, formatDate(u.joinedAt)])} /></section>}
      {tab === 'withdrawals' && <section className="admin-card"><div className="admin-card-head"><div><h2>Withdrawal requests</h2><p>Review and update payout processing. Failed requests are returned to the user wallet.</p></div></div><DataTable heads={['Account', 'Recipient', 'Phone', 'Amount', 'Status', 'Requested', 'Actions']} rows={withdrawals.map(w => [w.user?.email || '—', w.name, w.phone, `KSh ${w.amount.toFixed(2)}`, <span className={`admin-status ${w.status}`}>{w.status}</span>, formatDate(w.createdAt), w.status === 'pending' || w.status === 'processing' ? <div className="actions"><button onClick={() => run(() => API.setWithdrawalStatus(w.id, 'processing'))}>Processing</button><button onClick={() => run(() => API.setWithdrawalStatus(w.id, 'paid'))}>Mark paid</button><button className="danger-link" onClick={() => run(() => API.setWithdrawalStatus(w.id, 'failed'))}>Fail / refund</button></div> : 'Finalized'])} /></section>}
      {tab === 'activity' && <section className="admin-card"><div className="admin-card-head"><div><h2>Recent website activity</h2><p>Latest 250 tracked sign-ins, answers, account changes, and admin actions.</p></div></div><DataTable heads={['Event', 'Account', 'Details', 'Time']} rows={events.map(e => [e.type, e.email || 'System', Object.entries(e.details || {}).map(([k, v]) => `${k}: ${v}`).join(' · ') || '—', formatDate(e.created_at)])} /></section>}
      {tab === 'website' && <form className="admin-card admin-site-form" onSubmit={e => { e.preventDefault(); run(async () => { const data = await API.saveSiteSettings(settings); setSettings(data.settings); }); }}><div className="admin-card-head"><div><h2>Website content</h2><p>Changes here appear on the public survey home page.</p></div></div><label>Hero headline<input value={settings.heroTitle} onChange={e => setSettings({ ...settings, heroTitle: e.target.value })} maxLength={180} required /></label><label>Introductory text<textarea value={settings.heroCopy} onChange={e => setSettings({ ...settings, heroCopy: e.target.value })} maxLength={500} required /></label><label>Site notice (optional)<textarea value={settings.notice} onChange={e => setSettings({ ...settings, notice: e.target.value })} maxLength={500} /></label><button className="admin-primary" disabled={busy}><Save size={16} /> Save website content</button></form>}
    </main>
  </div>;
}

function Overview({ data }) {
  if (!data) return <div className="admin-loading">Loading analytics…</div>;
  const a = data.analytics;
  const metrics = [['Accounts', a.users, 'Active now: ' + a.activeUsers], ['Survey sets', a.surveys, 'Available on the site'], ['Answers', a.answers, 'Responses received'], ['Pending payouts', a.pendingWithdrawals, `Of ${a.withdrawals} requests`]];
  const max = Math.max(1, ...a.answersBySurvey.map(row => row.answers));
  return <><div className="admin-metrics">{metrics.map(([label, value, caption]) => <article key={label}><span>{label}</span><strong>{value}</strong><small>{caption}</small></article>)}</div><div className="admin-overview-grid"><section className="admin-card"><h2>Most answered surveys</h2>{a.answersBySurvey.map(row => <div className="admin-bar-row" key={row.surveyId}><span>{row.title}</span><div><i style={{ width: `${Math.max(3, row.answers / max * 100)}%` }} /></div><b>{row.answers}</b></div>)}</section><section className="admin-card"><h2>Surveys by tier</h2>{a.byTier.map(row => <div className="admin-tier-row" key={row._id}><span>{TIER_DETAILS[row._id]?.label || row._id}</span><strong>{row.count}</strong></div>)}</section><section className="admin-card admin-recent"><h2>Latest activity</h2>{data.events.slice(0, 8).map(event => <div className="admin-event" key={event._id}><span className="admin-event-dot" /><div><strong>{event.type.replaceAll('.', ' ')}</strong><small>{event.email || 'System'} · {formatDate(event.created_at)}</small></div></div>)}</section></div></>;
}

function DataTable({ heads, rows }) {
  return <div className="admin-table-wrap"><table><thead><tr>{heads.map(h => <th key={h}>{h}</th>)}</tr></thead><tbody>{rows.map((row, i) => <tr key={i}>{row.map((cell, j) => <td key={j}>{cell}</td>)}</tr>)}</tbody></table>{!rows.length && <div className="admin-empty">Nothing to show yet.</div>}</div>;
}
