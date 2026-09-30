import { connectDatabase, closeDatabase } from './db.js';
import { Survey } from './models.js';
import { SURVEY_SETS } from '../src/surveysData.js';

try {
  await connectDatabase();
  for (const set of SURVEY_SETS) {
    // Survey questions are small and always read with their survey, so they are embedded.
    await Survey.findOneAndUpdate(
      { _id: set.id },
      {
        $set: {
          title: set.title,
          tier: set.tier,
          unlock_fee: set.unlockFee,
          reward_per_question: set.rewardPerQuestion,
          questions: set.questions.map((q, index) => ({ id: q.id, sort_order: index + 1, text: q.text, options: q.options })),
        },
        $setOnInsert: { created_at: new Date() },
      },
      { upsert: true, runValidators: true },
    );
  }
  console.log(`Seeded ${SURVEY_SETS.length} survey sets.`);
} finally {
  await closeDatabase();
}
