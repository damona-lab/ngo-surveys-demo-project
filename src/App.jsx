import { useEffect, useMemo, useState } from 'react';
import { ArrowDownToLine, CircleDollarSign, CircleCheck, Sparkles, User, LogOut, LogIn, UserPlus, Plus, Pencil, Trash2, Archive, RotateCcw, Save, X } from 'lucide-react';
import { SURVEY_SETS, SURVEY_TIERS, TIER_DETAILS } from './surveysData';
import { useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import SurveyCard from './components/SurveyCard';
import PaymentModal from './components/PaymentModal';
import SurveyRunner from './components/SurveyRunner';
import WithdrawModal from './components/WithdrawModal';
import AuthModal from './components/AuthModal';
import ProfileModal from './components/ProfileModal';
import API from './api';
import AdminDashboard from './components/AdminDashboard';
import AdminLogin from './components/AdminLogin';

const blankSurvey = () => ({ title: '', description: '', tier: 'free', unlockFee: 0, rewardPerQuestion: 20, questions: [{ text: '', options: ['', '', '', ''] }] });

export default function App() {
  const { user, state, loading, answer, unlock, withdraw, logout } = useAuth();
  const [activeSurvey, setActiveSurvey] = useState(null);
  const [paymentSurvey, setPaymentSurvey] = useState(null);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [toast, setToast] = useState('');
  const [surveys, setSurveys] = useState(SURVEY_SETS);
  const [siteSettings, setSiteSettings] = useState({ heroTitle: 'Your voice can help shape impact.', heroCopy: 'Explore community research surveys, record your opinions, and earn rewards for sharing your perspective.', notice: '' });
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(blankSurvey());
  const [showForm, setShowForm] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(''), 2600); return () => clearTimeout(t); }, [toast]);
  const loadSurveys = () => {
    const req = user?.role === 'admin' ? API.adminSurveys() : API.surveys();
    req.then(data => { if (data.surveys?.length || user?.role === 'admin') setSurveys(data.surveys || []); }).catch(() => {});
  };
  useEffect(() => { loadSurveys(); }, [user?.role]);
  useEffect(() => { API.siteSettings().then(data => setSiteSettings(data.settings)).catch(() => {}); }, []);

  const answered = useMemo(() => Object.values(state.surveys).reduce((sum, item) => sum + (item.completedQuestions?.length || 0), 0), [state.surveys]);

  const openSurvey = survey => {
    const status = state.surveys[survey.id];
    if (survey.unlockFee && !status?.unlocked) setPaymentSurvey(survey);
    else setActiveSurvey(survey);
  };

  const unlockSurvey = async id => {
    await unlock(id);
    setPaymentSurvey(null);
    setToast('Survey unlocked');
  };

  const handleAnswer = async (surveyId, questionId, reward, answerIndex) => {
    await answer(surveyId, questionId, reward, answerIndex);
    setToast(`+ KSh ${reward.toFixed(2)} reward earned`);
  };

  const isAdmin = user?.role === 'admin';
  const tierOrder = [SURVEY_TIERS.FREE, SURVEY_TIERS.PREMIUM, SURVEY_TIERS.PREMIUM_PLUS, SURVEY_TIERS.ELITE];
  const isAdminRoute = window.location.pathname.replace(/\/$/, '') === '/admin';

  const beginEdit = survey => { setEditing(survey.id); setForm({ title: survey.title, description: survey.description || '', tier: survey.tier, unlockFee: survey.unlockFee, rewardPerQuestion: survey.rewardPerQuestion, questions: survey.questions.map(q => ({ id: q.id, text: q.text, options: [...q.options] })) }); setShowForm(true); };
  const closeForm = () => { setEditing(null); setForm(blankSurvey()); setShowForm(false); };
  const runSurveyAction = async (action, message) => { setBusy(true); try { await action(); loadSurveys(); setToast(message); } catch (e) { setToast(e.message); } finally { setBusy(false); } };
  const saveSurvey = async e => { e.preventDefault(); await runSurveyAction(async () => { if (editing) await API.updateSurvey(editing, form); else await API.createSurvey(form); closeForm(); }, editing ? 'Survey updated' : 'Survey added'); };
  const updateQuestion = (index, key, value) => setForm(old => ({ ...old, questions: old.questions.map((q, i) => i === index ? { ...q, [key]: value } : q) }));

  if (loading) return <div className="loading-screen"><div className="spinner" /> Loading…</div>;

  if (isAdminRoute) {
    if (!user) return <AdminLogin />;
    if (!isAdmin) return <div className="admin-denied"><h1>Administrator access required</h1><p>This account does not have admin privileges.</p><button className="primary-button" onClick={() => logout()}>Sign out</button></div>;
    return <AdminDashboard user={user} onLogout={logout} />;
  }
  if (!user) return <AuthModal open onClose={() => {}} />;

  return (
    <div id="top" className="app-shell">
      <Navbar
        balance={state.balance}
        totalEarned={state.totalEarned}
        userName={user.name}
        userEmail={user.email}
        onWithdraw={() => setWithdrawOpen(true)}
        onLogout={() => logout()}
        onProfile={() => setProfileOpen(true)}
        onTier={tier => document.getElementById(tier)?.scrollIntoView({ behavior: 'smooth' })}
      />
      <main>
        <section className="hero">
          <div className="hero-copy">
            <h1>{siteSettings.heroTitle}</h1>
            <p>{siteSettings.heroCopy}</p>
            <div className="hero-actions">
              <button className="primary-button" onClick={() => document.getElementById('free')?.scrollIntoView({ behavior: 'smooth' })}>Explore surveys <Sparkles size={18} /></button>
              <button className="text-button" onClick={() => setWithdrawOpen(true)}>Request payout <ArrowDownToLine size={17} /></button>
            </div>
          </div>
          <div className="hero-panel">
            <div className="impact-orb"><CircleDollarSign size={45} /></div>
            <p>YOUR WALLET</p>
            <strong>KSh {state.balance.toFixed(2)}</strong>
            <span><CircleCheck size={15} /> {answered} thoughtful answers recorded</span>
            <small>Available rewards</small>
          </div>
        </section>
        {siteSettings.notice && <section className="notice"><div><strong>Notice</strong><p>{siteSettings.notice}</p></div></section>}
        <section className="stats">
          <div><span>Survey sets</span><strong>{surveys.length}</strong><small>Across four research tiers</small></div>
          <div><span>Questions</span><strong>{surveys.reduce((sum, survey) => sum + survey.questions.length, 0)}</strong><small>Each answer is saved to the database</small></div>
          <div><span>Total rewards</span><strong>KSh {state.totalEarned.toFixed(2)}</strong><small>Earned from completed surveys</small></div>
        </section>
        {isAdmin && <section className="admin-inline-toolbar"><div><span className="eyebrow">ADMIN</span><h2>Manage surveys on the website</h2><p>Add, edit, archive/restore, or permanently delete surveys. Changes apply to the site.</p></div><button className="primary-button" onClick={() => { setEditing(null); setForm(blankSurvey()); setShowForm(true); }}><Plus size={17} /> Add survey</button></section>}
        {isAdmin && showForm && <section className="admin-inline-form">
          <div className="admin-inline-form-head"><h3>{editing ? 'Edit survey' : 'Add a survey'}</h3><button className="icon-close small" type="button" onClick={closeForm} aria-label="Close"><X size={18} /></button></div>
          <form onSubmit={saveSurvey}>
            <div className="admin-inline-grid">
              <label>Survey title<input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required maxLength={200} /></label>
              <label>Tier<select value={form.tier} onChange={e => setForm({ ...form, tier: e.target.value })}>{Object.entries(TIER_DETAILS).map(([v, d]) => <option key={v} value={v}>{d.label}</option>)}</select></label>
              <label>Description<input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} maxLength={500} /></label>
              <label>Unlock fee (KSh)<input type="number" min="0" value={form.unlockFee} onChange={e => setForm({ ...form, unlockFee: Number(e.target.value) })} required /></label>
              <label>Reward per answer (KSh)<input type="number" min="0" step="0.01" value={form.rewardPerQuestion} onChange={e => setForm({ ...form, rewardPerQuestion: Number(e.target.value) })} required /></label>
            </div>
            {form.questions.map((q, i) => <fieldset className="admin-inline-question" key={i}><legend>Question {i + 1}</legend><label>Question<input value={q.text} onChange={e => updateQuestion(i, 'text', e.target.value)} required maxLength={2000} /></label><label>Answer options <small>(one per line, 2–8)</small><textarea value={q.options.join('\n')} onChange={e => updateQuestion(i, 'options', e.target.value.split('\n'))} required /></label><button className="text-button danger-text" type="button" disabled={form.questions.length < 2} onClick={() => setForm(old => ({ ...old, questions: old.questions.filter((_, idx) => idx !== i) }))}>Remove question</button></fieldset>)}
            <div className="admin-inline-actions"><button className="text-button" type="button" onClick={() => setForm(old => ({ ...old, questions: [...old.questions, { text: '', options: ['', '', '', ''] }] }))}><Plus size={16} /> Add question</button><button className="primary-button" disabled={busy}><Save size={16} /> {busy ? 'Saving…' : 'Save survey'}</button></div>
          </form>
        </section>}
        {tierOrder.map(tier => (
          <section className="tier-section" id={tier} key={tier}>
            <div className="section-heading">
              <div>
                <span className={`tier-badge ${TIER_DETAILS[tier].color}`}>{TIER_DETAILS[tier].label}</span>
                <h2>{tier === 'free' ? 'Start with community insight' : tier === 'premium' ? 'Explore focused research' : tier === SURVEY_TIERS.PREMIUM_PLUS ? 'Contribute to global thinking' : 'Explore specialised research'}</h2>
                <p>{TIER_DETAILS[tier].description}</p>
              </div>
              {tier !== 'free' && <span className="unlock-note">Unlock fee: KSh {surveys.find(s => s.tier === tier)?.unlockFee ?? 0}</span>}
            </div>
            <div className="survey-grid">
              {surveys.filter(s => s.tier === tier).map(survey => (
                <div className={`survey-manage-wrap ${survey.active === false ? 'is-archived' : ''}`} key={survey.id}>
                  <SurveyCard survey={survey} status={state.surveys[survey.id]} onOpen={openSurvey} />
                  {isAdmin && <div className="survey-admin-actions">
                    {survey.active === false && <span className="archived-pill"><Archive size={13} /> Archived</span>}
                    <button onClick={() => beginEdit(survey)}><Pencil size={14} /> Edit</button>
                    {survey.active === false
                      ? <><button onClick={() => runSurveyAction(() => API.restoreSurvey(survey.id), 'Survey restored')}><RotateCcw size={14} /> Restore</button>{!survey.builtin && <button className="danger" onClick={() => { if (window.confirm(`Permanently delete “${survey.title}”? This removes it and its user progress/answers.`)) runSurveyAction(() => API.deleteSurvey(survey.id), 'Survey deleted'); }}><Trash2 size={14} /> Delete</button>}</>
                      : <button className="danger" onClick={() => { if (window.confirm(`Archive “${survey.title}”? It will be hidden from regular users.`)) runSurveyAction(() => API.archiveSurvey(survey.id), 'Survey archived'); }}><Archive size={14} /> Archive</button>}
                  </div>}
                </div>
              ))}
            </div>
          </section>
        ))}
        <section className="cashout-callout">
          <div><span className="eyebrow">PAYOUTS</span><h2>Withdraw your rewards.</h2><p>Once your wallet reaches KSh 500, you can request a payout to your M-Pesa number.</p></div>
          <button className="gold-button" disabled={state.balance < 500} onClick={() => setWithdrawOpen(true)}>
            {state.balance < 500 ? `KSh ${(500 - state.balance).toFixed(2)} to payout threshold` : 'Request payout'} <ArrowDownToLine size={18} />
          </button>
        </section>
      </main>
      <footer>NGO SURVEYS <span>•</span> Community research that rewards your perspective</footer>
      {toast && <div className="toast"><CircleCheck size={18} />{toast}</div>}
      {paymentSurvey && <PaymentModal survey={paymentSurvey} onClose={() => setPaymentSurvey(null)} onUnlock={unlockSurvey} />}
      {activeSurvey && <SurveyRunner survey={activeSurvey} completedIds={state.surveys[activeSurvey.id]?.completedQuestions || []} onAnswer={handleAnswer} onClose={() => setActiveSurvey(null)} />}
       {withdrawOpen && <WithdrawModal balance={state.balance} onWithdraw={(amount, name, phone) => withdraw(amount, name, phone)} onClose={() => setWithdrawOpen(false)} />}
       {profileOpen && <ProfileModal open={profileOpen} onClose={() => setProfileOpen(false)} />}
    </div>
  );
}
