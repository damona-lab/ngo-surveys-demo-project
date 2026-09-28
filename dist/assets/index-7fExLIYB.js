(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),t.credentials=e.crossOrigin===`use-credentials`?`include`:e.crossOrigin===`anonymous`?`omit`:`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e={FREE:`free`,PREMIUM:`premium`,PREMIUM_PLUS:`premium_plus`},t=(e,t,n)=>({id:e,text:t,options:n}),n=(e,n)=>n.map(([n,r],i)=>t(`${e}_q${i+1}`,n,r)),r=(...e)=>e,i=[{id:`free-1`,title:`Community Development`,tier:e.FREE,unlockFee:0,rewardPerQuestion:18.8,questions:n(`f1`,[[`Which local service would most improve daily life in your area?`,r(`Reliable water supply`,`Better roads and transport`,`Waste collection`,`Community health clinic`)],[`How often do you attend a community meeting?`,r(`At least monthly`,`A few times a year`,`Rarely`,`Never`)],[`Who should help decide community project priorities?`,r(`Residents and local leaders together`,`Local leaders only`,`National government only`,`Private companies only`)],[`What is the biggest barrier to volunteering locally?`,r(`Lack of time`,`Limited information`,`Transport costs`,`No barrier for me`)],[`Which approach best sustains a community project?`,r(`Local ownership and maintenance plans`,`One-time donations`,`External management only`,`Short-term campaigns`)]])},{id:`free-2`,title:`Digital Inclusion`,tier:e.FREE,unlockFee:0,rewardPerQuestion:18.8,questions:n(`f2`,[[`What device do you use most often to access the internet?`,r(`Smartphone`,`Shared computer`,`Tablet`,`I do not access the internet`)],[`What would make internet access more useful to you?`,r(`Lower data costs`,`Digital skills training`,`Better network coverage`,`More local online services`)],[`How confident are you using online government services?`,r(`Very confident`,`Somewhat confident`,`Not very confident`,`I have not used them`)],[`Which online safety topic is most important?`,r(`Recognising scams`,`Strong passwords`,`Privacy settings`,`Reporting harmful content`)],[`Where would you prefer to learn digital skills?`,r(`Community centre`,`School or college`,`Online lessons`,`Workplace training`)]])},{id:`free-3`,title:`Health & Nutrition`,tier:e.FREE,unlockFee:0,rewardPerQuestion:18.8,questions:n(`f3`,[[`What most affects your household’s ability to buy nutritious food?`,r(`Food prices`,`Income stability`,`Distance to markets`,`Limited nutrition information`)],[`How often does your household eat vegetables?`,r(`Most days`,`A few days a week`,`About weekly`,`Rarely`)],[`Where do you usually seek health information?`,r(`Health worker or clinic`,`Family and friends`,`Radio or TV`,`Social media`)],[`Which service would improve maternal and child health most?`,r(`Nearby antenatal care`,`Nutrition counselling`,`Affordable transport`,`Clean water access`)],[`What makes clinic visits difficult?`,r(`Cost`,`Travel time`,`Long queues`,`Opening hours`)]])},{id:`free-4`,title:`Climate Action`,tier:e.FREE,unlockFee:0,rewardPerQuestion:18.8,questions:n(`f4`,[[`Which climate impact concerns your household most?`,r(`Unpredictable rainfall`,`Extreme heat`,`Flooding`,`Rising food prices`)],[`What action do you currently take to reduce waste?`,r(`Reuse or repair items`,`Separate recyclables`,`Compost food waste`,`None regularly`)],[`Which clean energy option is most practical locally?`,r(`Solar home systems`,`Improved cookstoves`,`Biogas`,`Mini-grid electricity`)],[`Who should lead local climate preparedness?`,r(`Community groups with county support`,`National government`,`Businesses`,`International organisations`)],[`What would encourage tree planting?`,r(`Free seedlings and training`,`Cash incentives`,`More land access`,`School programmes`)]])},{id:`free-5`,title:`Youth Empowerment`,tier:e.FREE,unlockFee:0,rewardPerQuestion:18.8,questions:n(`f5`,[[`What support would help young people find work?`,r(`Practical job skills`,`Mentorship`,`Access to internships`,`Small business finance`)],[`Which sector offers the most opportunity for youth locally?`,r(`Technology and digital work`,`Agriculture`,`Construction`,`Creative industries`)],[`How accessible are youth-friendly spaces in your area?`,r(`Very accessible`,`Somewhat accessible`,`Not very accessible`,`Not available`)],[`What makes starting a small business difficult?`,r(`Startup capital`,`Finding customers`,`Business training`,`Licensing requirements`)],[`How should youth be included in local decisions?`,r(`Youth representatives on committees`,`Public forums`,`Online feedback`,`School-based consultations`)]])},{id:`prem-1`,title:`Clean Energy Adoption`,tier:e.PREMIUM,unlockFee:49,rewardPerQuestion:40,questions:n(`p1`,[[`What is your household’s main cooking fuel?`,r(`LPG gas`,`Charcoal or firewood`,`Electricity`,`Biogas`)],[`What is the main benefit you expect from solar power?`,r(`Lower energy bills`,`More reliable lighting`,`Phone charging`,`Business use`)],[`What prevents a switch to clean cooking?`,r(`Upfront equipment cost`,`Fuel availability`,`Limited product information`,`Cooking preferences`)],[`Which payment option would help you adopt solar?`,r(`Pay-as-you-go instalments`,`Microloan`,`Cash purchase discount`,`Community group financing`)],[`How important is product warranty when choosing energy equipment?`,r(`Very important`,`Somewhat important`,`Not very important`,`I am unsure`)]])},{id:`prem-2`,title:`Financial Inclusion in Rural Areas`,tier:e.PREMIUM,unlockFee:49,rewardPerQuestion:40,questions:n(`p2`,[[`Which financial service do you use most?`,r(`Mobile money`,`Bank account`,`Savings group`,`None regularly`)],[`What would make saving easier?`,r(`Flexible low-value deposits`,`Higher interest`,`Nearby agent`,`Savings reminders`)],[`What is your biggest concern about digital finance?`,r(`Fraud or scams`,`Transaction fees`,`Network failures`,`Privacy`)],[`How do you usually borrow for an emergency?`,r(`Family or friends`,`Savings group`,`Mobile loan`,`Bank or SACCO`)],[`Which support would help small businesses manage money?`,r(`Simple bookkeeping training`,`Affordable credit`,`Digital payments`,`Business insurance`)]])},{id:`prem-3`,title:`Clean Water Infrastructure`,tier:e.PREMIUM,unlockFee:49,rewardPerQuestion:40,questions:n(`p3`,[[`How long does it take to collect water on a typical day?`,r(`Under 15 minutes`,`15–30 minutes`,`31–60 minutes`,`Over one hour`)],[`Which water improvement should be prioritised?`,r(`Repair existing pipes`,`New boreholes`,`Household storage`,`Water quality testing`)],[`How is water quality usually checked locally?`,r(`By a trained provider`,`By appearance or smell`,`With home filters`,`It is not checked`)],[`What is a fair way to fund water maintenance?`,r(`Small community tariff`,`County funding`,`Donor support`,`Volunteer repairs`)],[`Which group is most affected by water shortages?`,r(`Women and girls`,`Small businesses`,`Schools`,`Health facilities`)]])},{id:`prem-4`,title:`Education Access`,tier:e.PREMIUM,unlockFee:49,rewardPerQuestion:40,questions:n(`p4`,[[`What most affects school attendance in your area?`,r(`School costs`,`Distance to school`,`Household responsibilities`,`Health or nutrition`)],[`Which learning resource is most needed?`,r(`Textbooks`,`Trained teachers`,`Digital devices`,`Safe classrooms`)],[`How can schools better support learners with disabilities?`,r(`Accessible facilities`,`Specialist teaching support`,`Learning materials`,`Transport assistance`)],[`Which programme best supports girls staying in school?`,r(`Menstrual health support`,`Scholarships`,`Safe transport`,`Parent engagement`)],[`How useful are after-school learning clubs?`,r(`Very useful`,`Somewhat useful`,`Not very useful`,`I am unsure`)]])},{id:`prem-5`,title:`Agricultural Technology`,tier:e.PREMIUM,unlockFee:49,rewardPerQuestion:40,questions:n(`p5`,[[`Which farming challenge is most pressing?`,r(`Changing weather`,`Pest control`,`Cost of inputs`,`Market access`)],[`Which tool would you most like to access?`,r(`Weather updates by phone`,`Drip irrigation`,`Soil testing`,`Market price alerts`)],[`Where do you get farming advice?`,r(`Extension officer`,`Other farmers`,`Agro-dealer`,`Radio or mobile app`)],[`What would improve your ability to use farm technology?`,r(`Hands-on training`,`Lower equipment cost`,`Reliable internet`,`Equipment leasing`)],[`How do you prefer to sell produce?`,r(`Local market`,`Farmer cooperative`,`Direct to buyers`,`Online marketplace`)]])},{id:`premplus-1`,title:`Global Health Initiatives`,tier:e.PREMIUM_PLUS,unlockFee:99,rewardPerQuestion:90,questions:n(`pp1`,[[`Which public health investment has the greatest impact?`,r(`Preventive care`,`Hospital equipment`,`Health insurance`,`Emergency response`)],[`What builds trust in a vaccination programme?`,r(`Clear local information`,`Celebrity endorsements`,`Social media advertising`,`Financial incentives`)],[`Which health data safeguard matters most?`,r(`Patient privacy`,`Faster reporting`,`Shared access`,`Public dashboards`)],[`How should health programmes reach remote communities?`,r(`Mobile clinics`,`Telehealth only`,`Central hospitals`,`Private pharmacies`)],[`What makes a global health partnership effective?`,r(`Locally led planning`,`Single donor control`,`Short funding cycles`,`Imported solutions`)]])},{id:`premplus-2`,title:`Sustainable Urbanization`,tier:e.PREMIUM_PLUS,unlockFee:99,rewardPerQuestion:90,questions:n(`pp2`,[[`What is the highest priority for growing towns?`,r(`Affordable housing`,`New shopping areas`,`Office buildings`,`Tourism facilities`)],[`Which transport investment would help most?`,r(`Safe public transit`,`More parking`,`Private toll roads`,`Airport expansion`)],[`How can neighbourhoods better manage waste?`,r(`Reliable collection and sorting`,`More landfill space`,`Fines only`,`Burning waste`)],[`What makes public spaces feel safe?`,r(`Good lighting and active use`,`High walls`,`Private security only`,`Restricted access`)],[`Which climate feature should new buildings include?`,r(`Water-efficient design`,`Larger glass façades`,`More air conditioning`,`Underground parking`)]])},{id:`premplus-3`,title:`Microfinance Impact`,tier:e.PREMIUM_PLUS,unlockFee:99,rewardPerQuestion:90,questions:n(`pp3`,[[`What makes a microloan useful for a small enterprise?`,r(`Affordable repayment terms`,`Largest possible amount`,`No business plan`,`Very short deadlines`)],[`Which non-financial service should accompany credit?`,r(`Business coaching`,`Advertising only`,`Tax collection`,`None`)],[`What loan repayment schedule works best for seasonal income?`,r(`Flexible seasonal payments`,`Daily fixed payments`,`One immediate payment`,`Weekly penalties`)],[`How should lenders assess responsible borrowing?`,r(`Income and cash flow`,`Social media followers`,`Personal connections`,`Age alone`)],[`What outcome best shows microfinance success?`,r(`Stable household income`,`Number of loans issued`,`Higher debt levels`,`Branch expansion`)]])},{id:`premplus-4`,title:`Disaster Relief Preparedness`,tier:e.PREMIUM_PLUS,unlockFee:99,rewardPerQuestion:90,questions:n(`pp4`,[[`What information is most important before a disaster?`,r(`Trusted early warnings`,`Social media rumours`,`National news only`,`None until it happens`)],[`Where should emergency supplies be stored?`,r(`Accessible community locations`,`Private homes only`,`Distant warehouses`,`Schools without access plans`)],[`Who should be included in preparedness planning?`,r(`Residents, especially vulnerable groups`,`Officials only`,`Businesses only`,`Emergency teams only`)],[`What is the best way to test an evacuation plan?`,r(`Practice drills`,`Written notices only`,`Wait for an emergency`,`Online survey only`)],[`Which recovery support matters most after a disaster?`,r(`Cash and essential services`,`Publicity campaigns`,`Short visits`,`New regulations only`)]])},{id:`premplus-5`,title:`AI in Humanitarian Aid`,tier:e.PREMIUM_PLUS,unlockFee:99,rewardPerQuestion:90,questions:n(`pp5`,[[`What is a helpful use of AI in humanitarian work?`,r(`Improving aid needs forecasts`,`Replacing local staff entirely`,`Selling personal data`,`Making final decisions alone`)],[`What should be checked before using AI-generated insights?`,r(`Accuracy and possible bias`,`How quickly it was made`,`Its visual design`,`Whether it is popular`)],[`Who should oversee AI tools used for aid decisions?`,r(`Human teams with community input`,`Technology vendors only`,`No one`,`Automated systems alone`)],[`What is essential when collecting data for AI?`,r(`Consent and data protection`,`Collecting everything possible`,`Publicly naming people`,`Selling data access`)],[`How should AI tools be introduced to field teams?`,r(`Training and gradual testing`,`Immediate mandatory use`,`Without explanation`,`Only through email`)]])}],a={[e.FREE]:{label:`Free`,description:`Start earning with open community surveys.`,color:`free`},[e.PREMIUM]:{label:`Premium`,description:`Unlock deeper research surveys.`,color:`premium`},[e.PREMIUM_PLUS]:{label:`Premium Plus`,description:`Take part in advanced impact research.`,color:`plus`}},o={balance:0,totalEarned:0,surveys:{},withdrawals:[]},s={...o},c=null,l=`login`,u=``,d=``,f=!1,p=null,m=null,h=!1,g=``,_=null,v=0,y=null,b=!1,x={name:``,phone:``,amount:``},S=``,C=!1,w=!1,T=!1;async function E(e,t={}){let n;try{n=await fetch(e,{...t,credentials:`same-origin`,headers:{"Content-Type":`application/json`,...t.headers||{}}})}catch{throw Error(`Cannot reach the account server. Start the app with “npm run dev” and check that MySQL is running.`)}let r=n.status===204?null:await n.json().catch(()=>null);if(!r&&!n.ok)throw Error(`The account server did not respond. Check its terminal for a MySQL or server startup error.`);if(!n.ok)throw Error(r?.error||`Request failed. Please try again.`);if(r===null)throw Error(`The account server returned an unexpected response. Check that the API server is running.`);return r}function D(){let e=new URLSearchParams(location.search).get(`reset`),t=e?`reset`:l,n=t===`signup`;return`<main class="auth-page"><section class="auth-card"><a class="brand auth-brand" href="#top"><span class="brand-mark"><img src="./logo pic.jfif" alt="" /></span><span>NGO <b>SURVEYS</b></span></a><p class="eyebrow">COMMUNITY RESEARCH</p><h1>${t===`reset`?`Choose a new password`:n?`Create your account`:t===`forgot`?`Reset your password`:`Welcome back`}</h1><p class="auth-intro">${t===`reset`?`Choose a strong password to secure your account.`:n?`Join the community and keep your survey progress safe.`:t===`forgot`?`We’ll email you a secure reset link if an account exists.`:`Sign in to continue to your surveys.`}</p>
    <form id="auth-form">${n?`<label>Full name<input name="name" autocomplete="name" required minlength="2" maxlength="120" /></label>`:``}${t===`reset`?``:`<label>Email address<input name="email" type="email" autocomplete="email" required maxlength="255" /></label>`}${[`login`,`signup`,`reset`].includes(t)?`<label>${t===`login`?`Password`:t===`reset`?`New password`:`Password`}<input name="password" type="password" autocomplete="${t===`login`?`current-password`:`new-password`}" required minlength="10" maxlength="72" /></label>`:``}
    ${u?`<p class="form-error">${u}</p>`:``}${d?`<p class="auth-message">${d}</p>`:``}<button class="primary-button full" ${f?`disabled`:``}>${f?`Please wait…`:t===`reset`?`Save new password`:t===`forgot`?`Send reset link`:n?`Create account`:`Sign in`}</button></form>
    ${e?``:`<div class="auth-links">${t===`login`?`<button data-auth-view="forgot">Forgot password?</button><span>New here? <button data-auth-view="signup">Create account</button></span>`:t===`signup`?`<span>Already have an account? <button data-auth-view="login">Sign in</button></span>`:`<span>Remembered it? <button data-auth-view="login">Sign in</button></span>`}</div>`}
    <p class="auth-secure">Passwords are securely hashed. Your account data is private.</p></section></main>`}function O(e){g=e,X(),_&&clearTimeout(_),_=setTimeout(()=>{g=``,X()},2600)}function k(){return Object.values(s.surveys).reduce((e,t)=>e+(t.completedQuestions?.length||0),0)}var A={ArrowDownToLine:`arrow-down-to-line`,CircleDollarSign:`circle-dollar-sign`,CircleCheck:`circle-check`,Sparkles:`sparkles`,WalletCards:`wallet-cards`,Landmark:`landmark`,LockKeyhole:`lock-keyhole`,Play:`play`,CheckCircle2:`check-circle-2`,Coins:`coins`,X:`x`,ShieldCheck:`shield-check`,AlertCircle:`alert-circle`,LoaderCircle:`loader-circle`,ArrowRight:`arrow-right`};function j(e,t){return`<i data-lucide="${A[e]||e.replace(/[A-Z]/g,e=>`-`+e.toLowerCase()).replace(/^-/,``)}"${t?` width="${t}" height="${t}"`:``}></i>`}function M(e){return String(e??``).replace(/[&<>"']/g,e=>({"&":`&amp;`,"<":`&lt;`,">":`&gt;`,'"':`&quot;`,"'":`&#39;`})[e])}function N(e){let t=s.surveys[e.id];if(e.unlockFee>0&&!t?.unlocked)m=e;else{p=e;let t=s.surveys[e.id]?.completedQuestions||[];v=Math.max(0,e.questions.findIndex(e=>!t.includes(e.id))),y=null,b=!1}X()}async function P(e,t,n){try{await E(`/api/answers`,{method:`POST`,body:JSON.stringify({surveyId:e,questionId:t,answerIndex:n})}),s=(await E(`/api/state`)).state,O(`+ KSh ${p.rewardPerQuestion.toFixed(2)} reward earned`)}catch(e){O(e.message)}}function F(){p=null,v=0,y=null,b=!1,X()}function I(){v===p.questions.length-1?F():(v++,y=null,b=!1,X())}function L(){let e=p,t=e.questions[v];if((s.surveys[e.id]?.completedQuestions||[]).includes(t.id)){I();return}if(y===null)return;let n=y;b=!0,X(),P(e.id,t.id,n).then(()=>X())}function R(e){e.preventDefault();let t=Number(x.amount);if(!x.name.trim()){S=`Enter a name for this request.`,X();return}if(!/^(?:07|01)\d{8}$/.test(x.phone.replace(/\s/g,``))){S=`Use a valid Kenyan mobile format: 07XXXXXXXX or 01XXXXXXXX.`,X();return}if(t<500||t>s.balance){S=`Enter an amount from KSh 500 to KSh ${s.balance.toFixed(2)}.`,X();return}S=``,C=!0,X(),E(`/api/withdrawals`,{method:`POST`,body:JSON.stringify({name:x.name,phone:x.phone,amount:t})}).then(async()=>{s=(await E(`/api/state`)).state,w=!0,x={...x,amount:String(t)}}).catch(e=>{S=e.message}).finally(()=>{C=!1,X()})}function z(){return`
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
        <span class="account-name">${M(c.name)}</span>
        <div class="wallet">
          ${j(`WalletCards`,18)}
          <span><small>Wallet balance</small><strong>KSh ${s.balance.toFixed(2)}</strong></span>
          <i>Total earned: KSh ${s.totalEarned.toFixed(2)}</i>
        </div>
        <button class="withdraw-nav" data-action="open-withdraw">
          ${j(`Landmark`,16)} <span>Withdraw</span>
        </button>
        <button class="signout-button" data-action="signout">Sign out</button>
      </div>
    </header>
  `}function B(){return`
    <section class="hero">
      <div class="hero-copy">
        <div class="demo-pill">Trusted by 2,800+ NGOs</div>
        <h1>Your voice can help shape <em>impact.</em></h1>
        <p>Explore community research surveys, record your opinions, and earn rewards for sharing your perspective.</p>
        <div class="hero-actions">
          <button class="primary-button" data-action="explore-surveys">${j(`Sparkles`,18)} Explore surveys</button>
          <button class="text-button" data-action="open-withdraw">${j(`ArrowDownToLine`,17)} Request payout</button>
        </div>
      </div>
      <div class="hero-panel">
        <div class="impact-orb">${j(`CircleDollarSign`,45)}</div>
        <p>YOUR WALLET</p>
        <strong>KSh ${s.balance.toFixed(2)}</strong>
        <span>${j(`CircleCheck`,15)} ${k()} thoughtful answers recorded</span>
        <small>Available rewards</small>
      </div>
    </section>
  `}function V(){return`
    <section class="stats">
      <div><span>Survey sets</span><strong>15</strong><small>Across three research tiers</small></div>
      <div><span>Questions</span><strong>75</strong><small>Each answer is saved locally</small></div>
      <div><span>Total rewards</span><strong>KSh ${s.totalEarned.toFixed(2)}</strong><small>Earned from completed surveys</small></div>
    </section>
  `}function H(e){let t=a[e.tier],n=s.surveys[e.id],r=n?.completedQuestions?.length||0,i=r===e.questions.length,o=e.unlockFee>0&&!n?.unlocked,c;c=o?`<button class="card-action locked" data-action="open-survey" data-survey="${e.id}">${j(`LockKeyhole`,16)} Unlock · KSh ${e.unlockFee}</button>`:i?`<button class="card-action" data-action="open-survey" data-survey="${e.id}">${j(`CheckCircle2`,16)} Review</button>`:`<button class="card-action" data-action="open-survey" data-survey="${e.id}">${j(`Play`,16)} ${r?`Continue`:`Start survey`}</button>`;let l=r/e.questions.length*100;return`
    <article class="survey-card ${t.color} ${i?`is-complete`:``}">
      <div class="card-top"><span class="tier-badge ${t.color}">${t.label}</span>${i?`<span class="completed-tag">${j(`CheckCircle2`,14)} Completed</span>`:``}</div>
      <h3>${e.title}</h3><p>${t.description}</p>
      <div class="reward-line">${j(`Coins`,17)}<span>KSh ${e.rewardPerQuestion.toFixed(2)} <small>per question</small></span></div>
      <div class="card-footer"><span>${r}/${e.questions.length} answered</span>${c}</div>
      <div class="progress-track"><span style="width:${l}%"></span></div>
    </article>
  `}function U(){return[e.FREE,e.PREMIUM,e.PREMIUM_PLUS].map(e=>{let t=a[e],n=i.filter(t=>t.tier===e),r=n.find(e=>e.unlockFee>0),o=e!==`free`&&r?`<span class="unlock-note">Unlock fee: KSh ${r.unlockFee}</span>`:``;return`
      <section class="tier-section" id="${e}">
        <div class="section-heading">
          <div><span class="tier-badge ${t.color}">${t.label}</span><h2>${{free:`Start with community insight`,premium:`Explore focused research`,premium_plus:`Contribute to global thinking`}[e]}</h2><p>${t.description}</p></div>
          ${o}
        </div>
        <div class="survey-grid">
          ${n.map(e=>H(e)).join(``)}
        </div>
      </section>
    `}).join(``)}function W(){return`
    <section class="cashout-callout">
      <div><span class="eyebrow">PAYOUTS</span><h2>Withdraw your rewards.</h2><p>Once your wallet reaches KSh 500, you can request a payout to your M-Pesa number.</p></div>
      <button class="gold-button" data-action="open-withdraw"${s.balance<500?` disabled`:``}>${s.balance<500?`KSh ${(500-s.balance).toFixed(2)} to payout threshold`:`Request payout`} ${j(`ArrowDownToLine`,18)}</button>
    </section>
  `}function G(){return g?`<div class="toast">${j(`CircleCheck`,18)}${g}</div>`:``}function K(){return m?`
    <div class="modal-backdrop" role="dialog" aria-modal="true">
      <section class="modal payment-modal">
        <button class="icon-close" data-action="close-payment" aria-label="Close">${j(`X`)}</button>
        <div class="modal-icon teal">${j(`ShieldCheck`)}</div>
        <span class="eyebrow">PAYMENT UNAVAILABLE</span>
        <h2>Unlock ${m.title}</h2>
        <p class="modal-copy">Paid survey access will be available after secure payment verification is connected. No payment is being collected here.</p>
      </section>
    </div>
  `:``}function q(){if(!p)return``;let e=p,t=s.surveys[e.id]?.completedQuestions||[],n=e.questions[v],r=t.includes(n.id);return`
    <div class="modal-backdrop runner-backdrop" role="dialog" aria-modal="true">
      <section class="runner">
        <div class="runner-head">
          <div><span class="eyebrow">${e.title}</span><h2>Question ${v+1} <small>of ${e.questions.length}</small></h2></div>
          <button class="icon-close" data-action="close-runner">${j(`X`)}</button>
        </div>
        <div class="runner-progress"><span style="width:${(v+1)/e.questions.length*100}%"></span></div>
        ${b?`
          <div class="reward-screen">
            <div class="reward-orb">${j(`Coins`,36)}</div>
            <span class="eyebrow">ANSWER SAVED</span>
            <h2>+ KSh ${e.rewardPerQuestion.toFixed(2)}</h2>
            <p>Your wallet has been updated with your reward.</p>
            <button class="primary-button" data-action="advance-runner">${v===e.questions.length-1?`Finish survey`:`Next question`} ${j(`ArrowRight`,18)}</button>
          </div>
        `:`
          <h3 class="question-text">${n.text}</h3>
          <div class="answers">
            ${n.options.map((e,t)=>`
              <button class="answer ${y===t?`selected`:``} ${r?`answered`:``}" data-option="${t}">
                <span>${String.fromCharCode(65+t)}</span>${e}${r?j(`CheckCircle2`,18):``}
              </button>
            `).join(``)}
          </div>
          <button class="primary-button submit-answer" data-action="submit-runner"${!r&&y===null?` disabled`:``}>${r?`Continue`:`Submit answer`} ${j(`ArrowRight`,18)}</button>
        `}
      </section>
    </div>
  `}function J(){if(!h)return``;let e=Number(x.amount);return`
    <div class="modal-backdrop" role="dialog" aria-modal="true">
      <section class="modal withdraw-modal">
        <button class="icon-close" data-action="close-withdraw">${j(`X`)}</button>
        ${w?`
          <div class="success-state">
            <div class="modal-icon green">${j(`CheckCircle2`,47)}</div>
            <span class="eyebrow">COMPLETE</span>
            <h2>Request recorded</h2>
            <p>KSh ${e.toFixed(2)} withdrawal request was recorded for ${M(x.phone)}. Payouts require review and are not sent automatically.</p>
            <button class="primary-button" data-action="close-withdraw">Close</button>
          </div>
        `:`
          <div class="modal-icon gold">${j(`Landmark`,36)}</div>
          <span class="eyebrow">CASH-OUT</span>
          <h2>Withdraw cash</h2>
          <p class="modal-copy">Minimum withdrawal: KSh 500. Funds are sent directly to your M-Pesa number.</p>
          <form id="withdraw-form">
            <label>Full name<input name="name" value="${M(x.name)}" placeholder="e.g. Amina Wanjiku" /></label>
            <label>M-Pesa phone number<input name="phone" value="${M(x.phone)}" placeholder="07XXXXXXXX" inputmode="numeric" /></label>
            <label>Amount (KSh)<input name="amount" value="${M(x.amount)}" placeholder="Available: ${s.balance.toFixed(2)}" type="number" min="500" max="${s.balance}" /></label>
            ${S?`<p class="form-error">${j(`AlertCircle`,15)}${S}</p>`:``}
            <button class="primary-button full" ${s.balance<500||C?`disabled`:``}>${C?`<span class="spin">${j(`LoaderCircle`,18)}</span> Processing…`:`Confirm withdrawal`}</button>
          </form>
        `}
      </section>
    </div>
  `}function Y(){return K()+q()+J()}function X(){let e=document.getElementById(`root`);if(!c){e.innerHTML=D(),T||Z();return}e.innerHTML=`
    <div class="app-shell">
      ${z()}
      <main>
        ${B()}
        ${V()}
        ${U()}
        ${W()}
      </main>
      <footer>NGO SURVEYS <span>•</span> Community research that rewards your perspective</footer>
      ${G()}
      ${Y()}
    </div>
  `,window.lucide&&lucide.createIcons(),T||Z()}function Z(){T=!0;let e=document.getElementById(`root`);e.addEventListener(`click`,function(e){let t=e.target,n=t.closest(`[data-auth-view]`);if(n){l=n.dataset.authView,u=``,d=``,X();return}let r=t.closest(`button[data-tier]`);if(r){document.getElementById(r.dataset.tier)?.scrollIntoView({behavior:`smooth`});return}let a=t.closest(`[data-action]`);if(a){switch(a.dataset.action){case`signout`:E(`/api/auth/logout`,{method:`POST`}).finally(()=>{c=null,s={...o},l=`login`,X()});break;case`open-withdraw`:h=!0,w=!1,x={name:``,phone:``,amount:``},S=``,X();break;case`close-withdraw`:h=!1,w=!1,x={name:``,phone:``,amount:``},X();break;case`close-payment`:m=null,X();break;case`open-survey`:{let e=a.dataset.survey,t=i.find(t=>t.id===e);t&&N(t);break}case`close-runner`:F();break;case`submit-runner`:L();break;case`advance-runner`:I();break;case`explore-surveys`:document.getElementById(`free`)?.scrollIntoView({behavior:`smooth`})}return}let f=t.closest(`.answer`);f&&p&&((s.surveys[p.id]?.completedQuestions||[]).includes(p.questions[v].id)||(y=parseInt(f.dataset.option),X()))}),e.addEventListener(`input`,function(e){let t=e.target;t.name&&(x[t.name]=t.value)}),e.addEventListener(`submit`,function(e){let t=e.target.closest(`form`);if(t&&t.id===`auth-form`){e.preventDefault();let n=new FormData(t),r=new URLSearchParams(location.search).get(`reset`),i=r?`reset`:l;f=!0,u=``,d=``,X();let a=Object.fromEntries(n.entries()),o=i===`signup`?`/api/auth/signup`:i===`login`?`/api/auth/login`:i===`forgot`?`/api/auth/reset-request`:`/api/auth/reset`,p=i===`reset`?{token:r,password:a.password}:a;E(o,{method:`POST`,body:JSON.stringify(p)}).then(async e=>{if(i===`forgot`||i===`reset`)d=e.message,i===`reset`&&(history.replaceState(null,``,location.pathname),l=`login`);else{c=e.user;let t=await E(`/api/state`);s=t.state,c=t.user}}).catch(e=>{u=e.message}).finally(()=>{f=!1,X()});return}t&&t.id===`withdraw-form`&&R(e)})}E(`/api/auth/me`).then(async({user:e})=>{c=e;let t=await E(`/api/state`);s=t.state,c=t.user}).catch(()=>{c=null}).finally(X);