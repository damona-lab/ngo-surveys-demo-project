export const SURVEY_TIERS = { FREE: 'free', PREMIUM: 'premium', PREMIUM_PLUS: 'premium_plus' };

const q = (id, text, options) => ({ id, text, options });
const questions = (prefix, rows) => rows.map(([text, options], i) => q(`${prefix}_q${i + 1}`, text, options));
const o = (...items) => items;

export const SURVEY_SETS = [
  {
    id: 'free-1', title: 'Community Development', tier: SURVEY_TIERS.FREE, unlockFee: 0, rewardPerQuestion: 18.8,
    questions: questions('f1', [
      ['Which local service would most improve daily life in your area?', o('Reliable water supply', 'Better roads and transport', 'Waste collection', 'Community health clinic')],
      ['How often do you attend a community meeting?', o('At least monthly', 'A few times a year', 'Rarely', 'Never')],
      ['Who should help decide community project priorities?', o('Residents and local leaders together', 'Local leaders only', 'National government only', 'Private companies only')],
      ['What is the biggest barrier to volunteering locally?', o('Lack of time', 'Limited information', 'Transport costs', 'No barrier for me')],
      ['Which approach best sustains a community project?', o('Local ownership and maintenance plans', 'One-time donations', 'External management only', 'Short-term campaigns')]
    ])
  },
  {
    id: 'free-2', title: 'Digital Inclusion', tier: SURVEY_TIERS.FREE, unlockFee: 0, rewardPerQuestion: 18.8,
    questions: questions('f2', [
      ['What device do you use most often to access the internet?', o('Smartphone', 'Shared computer', 'Tablet', 'I do not access the internet')],
      ['What would make internet access more useful to you?', o('Lower data costs', 'Digital skills training', 'Better network coverage', 'More local online services')],
      ['How confident are you using online government services?', o('Very confident', 'Somewhat confident', 'Not very confident', 'I have not used them')],
      ['Which online safety topic is most important?', o('Recognising scams', 'Strong passwords', 'Privacy settings', 'Reporting harmful content')],
      ['Where would you prefer to learn digital skills?', o('Community centre', 'School or college', 'Online lessons', 'Workplace training')]
    ])
  },
  {
    id: 'free-3', title: 'Health & Nutrition', tier: SURVEY_TIERS.FREE, unlockFee: 0, rewardPerQuestion: 18.8,
    questions: questions('f3', [
      ['What most affects your household’s ability to buy nutritious food?', o('Food prices', 'Income stability', 'Distance to markets', 'Limited nutrition information')],
      ['How often does your household eat vegetables?', o('Most days', 'A few days a week', 'About weekly', 'Rarely')],
      ['Where do you usually seek health information?', o('Health worker or clinic', 'Family and friends', 'Radio or TV', 'Social media')],
      ['Which service would improve maternal and child health most?', o('Nearby antenatal care', 'Nutrition counselling', 'Affordable transport', 'Clean water access')],
      ['What makes clinic visits difficult?', o('Cost', 'Travel time', 'Long queues', 'Opening hours')]
    ])
  },
  {
    id: 'free-4', title: 'Climate Action', tier: SURVEY_TIERS.FREE, unlockFee: 0, rewardPerQuestion: 18.8,
    questions: questions('f4', [
      ['Which climate impact concerns your household most?', o('Unpredictable rainfall', 'Extreme heat', 'Flooding', 'Rising food prices')],
      ['What action do you currently take to reduce waste?', o('Reuse or repair items', 'Separate recyclables', 'Compost food waste', 'None regularly')],
      ['Which clean energy option is most practical locally?', o('Solar home systems', 'Improved cookstoves', 'Biogas', 'Mini-grid electricity')],
      ['Who should lead local climate preparedness?', o('Community groups with county support', 'National government', 'Businesses', 'International organisations')],
      ['What would encourage tree planting?', o('Free seedlings and training', 'Cash incentives', 'More land access', 'School programmes')]
    ])
  },
  {
    id: 'free-5', title: 'Youth Empowerment', tier: SURVEY_TIERS.FREE, unlockFee: 0, rewardPerQuestion: 18.8,
    questions: questions('f5', [
      ['What support would help young people find work?', o('Practical job skills', 'Mentorship', 'Access to internships', 'Small business finance')],
      ['Which sector offers the most opportunity for youth locally?', o('Technology and digital work', 'Agriculture', 'Construction', 'Creative industries')],
      ['How accessible are youth-friendly spaces in your area?', o('Very accessible', 'Somewhat accessible', 'Not very accessible', 'Not available')],
      ['What makes starting a small business difficult?', o('Startup capital', 'Finding customers', 'Business training', 'Licensing requirements')],
      ['How should youth be included in local decisions?', o('Youth representatives on committees', 'Public forums', 'Online feedback', 'School-based consultations')]
    ])
  },
  {
    id: 'prem-1', title: 'Clean Energy Adoption', tier: SURVEY_TIERS.PREMIUM, unlockFee: 49, rewardPerQuestion: 40,
    questions: questions('p1', [
      ['What is your household’s main cooking fuel?', o('LPG gas', 'Charcoal or firewood', 'Electricity', 'Biogas')],
      ['What is the main benefit you expect from solar power?', o('Lower energy bills', 'More reliable lighting', 'Phone charging', 'Business use')],
      ['What prevents a switch to clean cooking?', o('Upfront equipment cost', 'Fuel availability', 'Limited product information', 'Cooking preferences')],
      ['Which payment option would help you adopt solar?', o('Pay-as-you-go instalments', 'Microloan', 'Cash purchase discount', 'Community group financing')],
      ['How important is product warranty when choosing energy equipment?', o('Very important', 'Somewhat important', 'Not very important', 'I am unsure')]
    ])
  },
  {
    id: 'prem-2', title: 'Financial Inclusion in Rural Areas', tier: SURVEY_TIERS.PREMIUM, unlockFee: 49, rewardPerQuestion: 40,
    questions: questions('p2', [
      ['Which financial service do you use most?', o('Mobile money', 'Bank account', 'Savings group', 'None regularly')],
      ['What would make saving easier?', o('Flexible low-value deposits', 'Higher interest', 'Nearby agent', 'Savings reminders')],
      ['What is your biggest concern about digital finance?', o('Fraud or scams', 'Transaction fees', 'Network failures', 'Privacy')],
      ['How do you usually borrow for an emergency?', o('Family or friends', 'Savings group', 'Mobile loan', 'Bank or SACCO')],
      ['Which support would help small businesses manage money?', o('Simple bookkeeping training', 'Affordable credit', 'Digital payments', 'Business insurance')]
    ])
  },
  {
    id: 'prem-3', title: 'Clean Water Infrastructure', tier: SURVEY_TIERS.PREMIUM, unlockFee: 49, rewardPerQuestion: 40,
    questions: questions('p3', [
      ['How long does it take to collect water on a typical day?', o('Under 15 minutes', '15–30 minutes', '31–60 minutes', 'Over one hour')],
      ['Which water improvement should be prioritised?', o('Repair existing pipes', 'New boreholes', 'Household storage', 'Water quality testing')],
      ['How is water quality usually checked locally?', o('By a trained provider', 'By appearance or smell', 'With home filters', 'It is not checked')],
      ['What is a fair way to fund water maintenance?', o('Small community tariff', 'County funding', 'Donor support', 'Volunteer repairs')],
      ['Which group is most affected by water shortages?', o('Women and girls', 'Small businesses', 'Schools', 'Health facilities')]
    ])
  },
  {
    id: 'prem-4', title: 'Education Access', tier: SURVEY_TIERS.PREMIUM, unlockFee: 49, rewardPerQuestion: 40,
    questions: questions('p4', [
      ['What most affects school attendance in your area?', o('School costs', 'Distance to school', 'Household responsibilities', 'Health or nutrition')],
      ['Which learning resource is most needed?', o('Textbooks', 'Trained teachers', 'Digital devices', 'Safe classrooms')],
      ['How can schools better support learners with disabilities?', o('Accessible facilities', 'Specialist teaching support', 'Learning materials', 'Transport assistance')],
      ['Which programme best supports girls staying in school?', o('Menstrual health support', 'Scholarships', 'Safe transport', 'Parent engagement')],
      ['How useful are after-school learning clubs?', o('Very useful', 'Somewhat useful', 'Not very useful', 'I am unsure')]
    ])
  },
  {
    id: 'prem-5', title: 'Agricultural Technology', tier: SURVEY_TIERS.PREMIUM, unlockFee: 49, rewardPerQuestion: 40,
    questions: questions('p5', [
      ['Which farming challenge is most pressing?', o('Changing weather', 'Pest control', 'Cost of inputs', 'Market access')],
      ['Which tool would you most like to access?', o('Weather updates by phone', 'Drip irrigation', 'Soil testing', 'Market price alerts')],
      ['Where do you get farming advice?', o('Extension officer', 'Other farmers', 'Agro-dealer', 'Radio or mobile app')],
      ['What would improve your ability to use farm technology?', o('Hands-on training', 'Lower equipment cost', 'Reliable internet', 'Equipment leasing')],
      ['How do you prefer to sell produce?', o('Local market', 'Farmer cooperative', 'Direct to buyers', 'Online marketplace')]
    ])
  },
  {
    id: 'premplus-1', title: 'Global Health Initiatives', tier: SURVEY_TIERS.PREMIUM_PLUS, unlockFee: 99, rewardPerQuestion: 90,
    questions: questions('pp1', [
      ['Which public health investment has the greatest impact?', o('Preventive care', 'Hospital equipment', 'Health insurance', 'Emergency response')],
      ['What builds trust in a vaccination programme?', o('Clear local information', 'Celebrity endorsements', 'Social media advertising', 'Financial incentives')],
      ['Which health data safeguard matters most?', o('Patient privacy', 'Faster reporting', 'Shared access', 'Public dashboards')],
      ['How should health programmes reach remote communities?', o('Mobile clinics', 'Telehealth only', 'Central hospitals', 'Private pharmacies')],
      ['What makes a global health partnership effective?', o('Locally led planning', 'Single donor control', 'Short funding cycles', 'Imported solutions')]
    ])
  },
  {
    id: 'premplus-2', title: 'Sustainable Urbanization', tier: SURVEY_TIERS.PREMIUM_PLUS, unlockFee: 99, rewardPerQuestion: 90,
    questions: questions('pp2', [
      ['What is the highest priority for growing towns?', o('Affordable housing', 'New shopping areas', 'Office buildings', 'Tourism facilities')],
      ['Which transport investment would help most?', o('Safe public transit', 'More parking', 'Private toll roads', 'Airport expansion')],
      ['How can neighbourhoods better manage waste?', o('Reliable collection and sorting', 'More landfill space', 'Fines only', 'Burning waste')],
      ['What makes public spaces feel safe?', o('Good lighting and active use', 'High walls', 'Private security only', 'Restricted access')],
      ['Which climate feature should new buildings include?', o('Water-efficient design', 'Larger glass façades', 'More air conditioning', 'Underground parking')]
    ])
  },
  {
    id: 'premplus-3', title: 'Microfinance Impact', tier: SURVEY_TIERS.PREMIUM_PLUS, unlockFee: 99, rewardPerQuestion: 90,
    questions: questions('pp3', [
      ['What makes a microloan useful for a small enterprise?', o('Affordable repayment terms', 'Largest possible amount', 'No business plan', 'Very short deadlines')],
      ['Which non-financial service should accompany credit?', o('Business coaching', 'Advertising only', 'Tax collection', 'None')],
      ['What loan repayment schedule works best for seasonal income?', o('Flexible seasonal payments', 'Daily fixed payments', 'One immediate payment', 'Weekly penalties')],
      ['How should lenders assess responsible borrowing?', o('Income and cash flow', 'Social media followers', 'Personal connections', 'Age alone')],
      ['What outcome best shows microfinance success?', o('Stable household income', 'Number of loans issued', 'Higher debt levels', 'Branch expansion')]
    ])
  },
  {
    id: 'premplus-4', title: 'Disaster Relief Preparedness', tier: SURVEY_TIERS.PREMIUM_PLUS, unlockFee: 99, rewardPerQuestion: 90,
    questions: questions('pp4', [
      ['What information is most important before a disaster?', o('Trusted early warnings', 'Social media rumours', 'National news only', 'None until it happens')],
      ['Where should emergency supplies be stored?', o('Accessible community locations', 'Private homes only', 'Distant warehouses', 'Schools without access plans')],
      ['Who should be included in preparedness planning?', o('Residents, especially vulnerable groups', 'Officials only', 'Businesses only', 'Emergency teams only')],
      ['What is the best way to test an evacuation plan?', o('Practice drills', 'Written notices only', 'Wait for an emergency', 'Online survey only')],
      ['Which recovery support matters most after a disaster?', o('Cash and essential services', 'Publicity campaigns', 'Short visits', 'New regulations only')]
    ])
  },
  {
    id: 'premplus-5', title: 'AI in Humanitarian Aid', tier: SURVEY_TIERS.PREMIUM_PLUS, unlockFee: 99, rewardPerQuestion: 90,
    questions: questions('pp5', [
      ['What is a helpful use of AI in humanitarian work?', o('Improving aid needs forecasts', 'Replacing local staff entirely', 'Selling personal data', 'Making final decisions alone')],
      ['What should be checked before using AI-generated insights?', o('Accuracy and possible bias', 'How quickly it was made', 'Its visual design', 'Whether it is popular')],
      ['Who should oversee AI tools used for aid decisions?', o('Human teams with community input', 'Technology vendors only', 'No one', 'Automated systems alone')],
      ['What is essential when collecting data for AI?', o('Consent and data protection', 'Collecting everything possible', 'Publicly naming people', 'Selling data access')],
      ['How should AI tools be introduced to field teams?', o('Training and gradual testing', 'Immediate mandatory use', 'Without explanation', 'Only through email')]
    ])
  }
];

export const TIER_DETAILS = {
  [SURVEY_TIERS.FREE]: { label: 'Free', description: 'Start earning with open community surveys.', color: 'free' },
  [SURVEY_TIERS.PREMIUM]: { label: 'Premium', description: 'Unlock deeper research surveys.', color: 'premium' },
  [SURVEY_TIERS.PREMIUM_PLUS]: { label: 'Premium Plus', description: 'Take part in advanced impact research.', color: 'plus' }
};
