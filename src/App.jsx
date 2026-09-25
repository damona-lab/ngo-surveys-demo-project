import { useEffect, useMemo, useState } from 'react';
import { ArrowDownToLine, CircleDollarSign, CircleCheck, Sparkles } from 'lucide-react';
import { SURVEY_SETS, SURVEY_TIERS, TIER_DETAILS } from './surveysData';
import Navbar from './components/Navbar';
import SurveyCard from './components/SurveyCard';
import PaymentModal from './components/PaymentModal';
import SurveyRunner from './components/SurveyRunner';
import WithdrawModal from './components/WithdrawModal';

const STORE_KEY = 'ngo-surveys-v1';
const blankState = { balance: 0, totalEarned: 0, surveys: {}, withdrawals: [] };
const getInitialState = () => { try { return { ...blankState, ...JSON.parse(localStorage.getItem(STORE_KEY)) }; } catch { return blankState; } };

export default function App() {
  const [state, setState] = useState(getInitialState);
  const [activeSurvey, setActiveSurvey] = useState(null); const [paymentSurvey, setPaymentSurvey] = useState(null); const [withdrawOpen, setWithdrawOpen] = useState(false); const [toast, setToast] = useState('');
  useEffect(() => localStorage.setItem(STORE_KEY, JSON.stringify(state)), [state]);
  const answered = useMemo(() => Object.values(state.surveys).reduce((sum, item) => sum + (item.completedQuestions?.length || 0), 0), [state.surveys]);
  const openSurvey = survey => { const status = state.surveys[survey.id]; if (survey.unlockFee && !status?.unlocked) setPaymentSurvey(survey); else setActiveSurvey(survey); };
  const unlock = id => { setState(s => ({ ...s, surveys: { ...s.surveys, [id]: { ...s.surveys[id], unlocked: true, completedQuestions: s.surveys[id]?.completedQuestions || [] } } })); setToast('Survey unlocked'); };
  const answer = (surveyId, questionId, reward) => { setState(s => { const survey = s.surveys[surveyId] || { unlocked: true, completedQuestions: [] }; if (survey.completedQuestions.includes(questionId)) return s; return { ...s, balance: +(s.balance + reward).toFixed(2), totalEarned: +(s.totalEarned + reward).toFixed(2), surveys: { ...s.surveys, [surveyId]: { ...survey, completedQuestions: [...survey.completedQuestions, questionId] } } }; }); setToast(`+ KSh ${reward.toFixed(2)} reward earned`); };
  const withdraw = amount => { setState(s => ({ ...s, balance: +(s.balance - amount).toFixed(2), withdrawals: [...s.withdrawals, { amount, at: new Date().toISOString() }] })); };
  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(''), 2600); return () => clearTimeout(t); }, [toast]);
  const tierOrder = [SURVEY_TIERS.FREE, SURVEY_TIERS.PREMIUM, SURVEY_TIERS.PREMIUM_PLUS];
  return <div id="top" className="app-shell"><Navbar balance={state.balance} totalEarned={state.totalEarned} onWithdraw={() => setWithdrawOpen(true)} onTier={tier => document.getElementById(tier)?.scrollIntoView({ behavior: 'smooth' })} />
    <main><section className="hero"><div className="hero-copy"><h1>Your voice can help shape <em>impact.</em></h1><p>Explore community research surveys, record your opinions, and earn rewards for sharing your perspective.</p><div className="hero-actions"><button className="primary-button" onClick={() => document.getElementById('free')?.scrollIntoView({ behavior: 'smooth' })}>Explore surveys <Sparkles size={18} /></button><button className="text-button" onClick={() => setWithdrawOpen(true)}>Request payout <ArrowDownToLine size={17} /></button></div></div><div className="hero-panel"><div className="impact-orb"><CircleDollarSign size={45} /></div><p>YOUR WALLET</p><strong>KSh {state.balance.toFixed(2)}</strong><span><CircleCheck size={15} /> {answered} thoughtful answers recorded</span><small>Available rewards</small></div></section>
    <section className="stats"><div><span>Survey sets</span><strong>15</strong><small>Across three research tiers</small></div><div><span>Questions</span><strong>75</strong><small>Each answer is saved locally</small></div><div><span>Total rewards</span><strong>KSh {state.totalEarned.toFixed(2)}</strong><small>Earned from completed surveys</small></div></section>
    {tierOrder.map(tier => <section className="tier-section" id={tier} key={tier}><div className="section-heading"><div><span className={`tier-badge ${TIER_DETAILS[tier].color}`}>{TIER_DETAILS[tier].label}</span><h2>{tier === 'free' ? 'Start with community insight' : tier === 'premium' ? 'Explore focused research' : 'Contribute to global thinking'}</h2><p>{TIER_DETAILS[tier].description}</p></div>{tier !== 'free' && <span className="unlock-note">Unlock fee: KSh {SURVEY_SETS.find(s => s.tier === tier).unlockFee}</span>}</div><div className="survey-grid">{SURVEY_SETS.filter(s => s.tier === tier).map(survey => <SurveyCard key={survey.id} survey={survey} status={state.surveys[survey.id]} onOpen={openSurvey} />)}</div></section>)}
    <section className="cashout-callout"><div><span className="eyebrow">PAYOUTS</span><h2>Withdraw your rewards.</h2><p>Once your wallet reaches KSh 500, you can request a payout to your M-Pesa number.</p></div><button className="gold-button" disabled={state.balance < 500} onClick={() => setWithdrawOpen(true)}>{state.balance < 500 ? `KSh ${(500 - state.balance).toFixed(2)} to payout threshold` : 'Request payout'} <ArrowDownToLine size={18} /></button></section>
    </main><footer>NGO SURVEYS <span>•</span> Community research that rewards your perspective</footer>
    {toast && <div className="toast"><CircleCheck size={18} />{toast}</div>}{paymentSurvey && <PaymentModal survey={paymentSurvey} onClose={() => setPaymentSurvey(null)} onUnlock={unlock} />}{activeSurvey && <SurveyRunner survey={activeSurvey} completedIds={state.surveys[activeSurvey.id]?.completedQuestions || []} onAnswer={answer} onClose={() => setActiveSurvey(null)} />}{withdrawOpen && <WithdrawModal balance={state.balance} onWithdraw={withdraw} onClose={() => setWithdrawOpen(false)} />}
  </div>;
}
