import { LockKeyhole, Play, CheckCircle2, Coins } from 'lucide-react';
import { TIER_DETAILS } from '../surveysData';

export default function SurveyCard({ survey, status, onOpen }) {
  const details = TIER_DETAILS[survey.tier];
  const completed = status?.completedQuestions?.length || 0;
  const isCompleted = completed === survey.questions.length;
  const locked = survey.unlockFee > 0 && !status?.unlocked;
  return <article className={`survey-card ${details.color} ${isCompleted ? 'is-complete' : ''}`}>
    <div className="card-top"><span className={`tier-badge ${details.color}`}>{details.label}</span>{isCompleted && <span className="completed-tag"><CheckCircle2 size={14} /> Completed</span>}</div>
    <h3>{survey.title}</h3><p>{details.description}</p>
    <div className="reward-line"><Coins size={17} /><span>KSh {survey.rewardPerQuestion.toFixed(2)} <small>per question</small></span></div>
    <div className="card-footer"><span>{completed}/{survey.questions.length} answered</span><button className={locked ? 'card-action locked' : 'card-action'} onClick={() => onOpen(survey)}>{locked ? <><LockKeyhole size={16} /> Unlock · KSh {survey.unlockFee}</> : isCompleted ? <><CheckCircle2 size={16} /> Review</> : <><Play size={16} /> {completed ? 'Continue' : 'Start survey'}</>}</button></div>
    <div className="progress-track"><span style={{ width: `${(completed / survey.questions.length) * 100}%` }} /></div>
  </article>;
}
