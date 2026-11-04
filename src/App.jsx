import { useEffect, useMemo, useState } from 'react';
import { ArrowDownToLine, CircleDollarSign, CircleCheck, Sparkles, User, LogOut, LogIn, UserPlus } from 'lucide-react';
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

export default function App() {
  const { user, state, loading, answer, unlock, withdraw, logout } = useAuth();
  const [activeSurvey, setActiveSurvey] = useState(null);
  const [paymentSurvey, setPaymentSurvey] = useState(null);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [toast, setToast] = useState('');
  const [surveys, setSurveys] = useState(SURVEY_SETS);
  const [siteSettings, setSiteSettings] = useState({ heroTitle: 'Your voice can help shape impact.', heroCopy: 'Explore community research surveys, record your opinions, and earn rewards for sharing your perspective.', notice: '' });

  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(''), 2600); return () => clearTimeout(t); }, [toast]);
  useEffect(() => {
    API.surveys().then(data => { if (data.surveys?.length) setSurveys(data.surveys); }).catch(() => {});
    API.siteSettings().then(data => setSiteSettings(data.settings)).catch(() => {});
  }, []);

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

  const tierOrder = [SURVEY_TIERS.FREE, SURVEY_TIERS.PREMIUM, SURVEY_TIERS.PREMIUM_PLUS, SURVEY_TIERS.ELITE];
  const isAdminRoute = window.location.pathname.replace(/\/$/, '') === '/admin';

  if (loading) return <div className="loading-screen"><div className="spinner" /> Loading…</div>;

  if (isAdminRoute) {
    if (!user) return <AdminLogin />;
    if (user.role !== 'admin') return <div className="admin-denied"><h1>Administrator access required</h1><p>This account does not have admin privileges.</p><button className="primary-button" onClick={() => logout()}>Sign out</button></div>;
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
                <SurveyCard key={survey.id} survey={survey} status={state.surveys[survey.id]} onOpen={openSurvey} />
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
