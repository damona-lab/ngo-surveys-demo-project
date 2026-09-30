import { useState } from 'react';
import { X, ArrowRight, CheckCircle2, Coins } from 'lucide-react';

export default function SurveyRunner({ survey, completedIds, onAnswer, onClose }) {
  const [index, setIndex] = useState(Math.max(0, survey.questions.findIndex(item => !completedIds.includes(item.id))));
  const [choice, setChoice] = useState(null);
  const [done, setDone] = useState(false);
  const question = survey.questions[index];
  const alreadyDone = completedIds.includes(question.id);

  const submit = () => {
    if (alreadyDone) return advance();
    if (choice === null) return;
    onAnswer(survey.id, question.id, survey.rewardPerQuestion);
    setDone(true);
  };

  const advance = () => {
    if (index === survey.questions.length - 1) return onClose();
    setIndex(index + 1);
    setChoice(null);
    setDone(false);
  };

  return (
    <div className="modal-backdrop runner-backdrop" role="dialog" aria-modal="true">
      <section className="runner">
        <div className="runner-head">
          <div>
            <span className="eyebrow">{survey.title}</span>
            <h2>Question {index + 1} <small>of {survey.questions.length}</small></h2>
          </div>
          <button className="icon-close" onClick={onClose}><X /></button>
        </div>
        <div className="runner-progress"><span style={{ width: `${((index + 1) / survey.questions.length) * 100}%` }} /></div>
        {done ? (
          <div className="reward-screen">
            <div className="reward-orb"><Coins size={36} /></div>
            <span className="eyebrow">ANSWER SAVED</span>
            <h2>+ KSh {survey.rewardPerQuestion.toFixed(2)}</h2>
            <p>Your wallet has been updated with your reward.</p>
            <button className="primary-button" onClick={advance}>{index === survey.questions.length - 1 ? 'Finish survey' : 'Next question'} <ArrowRight size={18} /></button>
          </div>
        ) : (
          <>
            <h3 className="question-text">{question.text}</h3>
            <div className="answers">
              {question.options.map((option, i) => (
                <button key={option} className={`answer ${choice === i ? 'selected' : ''} ${alreadyDone ? 'answered' : ''}`} onClick={() => !alreadyDone && setChoice(i)}>
                  <span>{String.fromCharCode(65 + i)}</span>{option}{alreadyDone && <CheckCircle2 size={18} />}
                </button>
              ))}
            </div>
            <button className="primary-button submit-answer" disabled={!alreadyDone && choice === null} onClick={submit}>
              {alreadyDone ? 'Continue' : 'Submit answer'} <ArrowRight size={18} />
            </button>
          </>
        )}
      </section>
    </div>
  );
}