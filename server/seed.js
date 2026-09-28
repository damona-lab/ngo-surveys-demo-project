import pool from './db.js';
import { SURVEY_SETS } from '../src/surveysData.js';

try {
  for (const set of SURVEY_SETS) {
    await pool.execute(`INSERT INTO surveys (id,title,tier,unlock_fee,reward_per_question) VALUES (?,?,?,?,?)
      ON DUPLICATE KEY UPDATE title=VALUES(title),tier=VALUES(tier),unlock_fee=VALUES(unlock_fee),reward_per_question=VALUES(reward_per_question)`,
    [set.id,set.title,set.tier,set.unlockFee,set.rewardPerQuestion]);
    for (const [i,q] of set.questions.entries()) await pool.execute(`INSERT INTO survey_questions(id,survey_id,sort_order,text,options) VALUES(?,?,?,?,?)
      ON DUPLICATE KEY UPDATE text=VALUES(text),options=VALUES(options)`, [q.id,set.id,i+1,q.text,JSON.stringify(q.options)]);
  }
  console.log(`Seeded ${SURVEY_SETS.length} survey sets.`);
} finally { await pool.end(); }
