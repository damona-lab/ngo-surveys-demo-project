const { MongoClient } = require('mongodb');

const tests = [
  ['current', 'mongodb+srv://otienodamon620_db_user:tTgzFAqbVQj9fBJv@cluster0.1r0o2vq.mongodb.net/ngo_surveys?retryWrites=true&w=majority'],
  ['bare-db', 'mongodb+srv://otienodamon620_db_user:tTgzFAqbVQj9fBJv@cluster0.1r0o2vq.mongodb.net/ngo_surveys'],
  ['old-pwd', 'mongodb+srv://otienodamon620_db_user:Damon0106@cluster0.1r0o2vq.mongodb.net/ngo_surveys?retryWrites=true&w=majority'],
  ['no-db', 'mongodb+srv://otienodamon620_db_user:tTgzFAqbVQj9fBJv@cluster0.1r0o2vq.mongodb.net/admin'],
  ['alt-pwd', 'mongodb+srv://otienodamon620_db_user:tTgzFAqbVQj9fBJv@cluster0.1r0o2vq.mongodb.net/'],
];

(async () => {
  for (const [label, uri] of tests) {
    try {
      const c = await MongoClient.connect(uri, { serverSelectionTimeoutMS: 15000 });
      const db = c.db('ngo_surveys');
      const r = await db.command({ ping: 1 });
      console.log(label, 'OK', JSON.stringify(r));
      await c.close();
    } catch (e) {
      console.log(label, 'FAIL', e.message);
    }
  }
})();