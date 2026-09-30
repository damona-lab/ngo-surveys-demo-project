import { MongoClient } from 'mongodb';

const ADMIN_URI = process.env.MONGO_ADMIN_URI || 'mongodb://127.0.0.1:27017/admin?directConnection=true';
const BOOTSTRAP_URI = process.env.MONGO_BOOTSTRAP_URI || 'mongodb://127.0.0.1:27017/admin?directConnection=true';
const ADMIN_USER = process.env.MONGO_ADMIN_USER || 'ngoSurveysAdmin';
const ADMIN_PASSWORD = process.env.MONGO_ADMIN_PASSWORD;
const APP_USER = process.env.MONGO_APP_USER || 'ngo_surveys';
const APP_PASSWORD = process.env.MONGO_APP_PASSWORD;
const APP_DB = process.env.MONGODB_DB || 'ngo_surveys';

if (!ADMIN_PASSWORD || !APP_PASSWORD) throw new Error('Set MONGO_ADMIN_PASSWORD and MONGO_APP_PASSWORD before running db:setup.');

// The first run has no users yet, so mongod must be started without --auth and the
// localhost exception allows creating them. Every later run uses the admin account.
async function connect() {
  try {
    const client = new MongoClient(ADMIN_URI, { serverSelectionTimeoutMS: 5000 });
    await client.connect();
    return { client, bootstrapped: false };
  } catch {
    const client = new MongoClient(BOOTSTRAP_URI, { serverSelectionTimeoutMS: 5000 });
    await client.connect();
    console.log('Connected without credentials (first run).');
    return { client, bootstrapped: true };
  }
}

const { client, bootstrapped } = await connect();
const admin = client.db('admin');

try {
  // A single-node replica set is what enables multi-document transactions locally.
  // These commands need cluster-admin rights, which the maintenance account does not
  // have, so they only run during the unauthenticated first run.
  if (bootstrapped) {
    try {
      const status = await admin.command({ replSetGetStatus: 1 });
      console.log(`Replica set "${status.set}" is already initiated.`);
    } catch (err) {
      if (err.codeName !== 'NotYetInitialized') throw err;
      console.log('Initiating replica set "rs0"...');
      await admin.command({ replSetInitiate: { _id: 'rs0', members: [{ _id: 0, host: '127.0.0.1:27017' }] } });
    }
  }

  for (let attempt = 0; ; attempt++) {
    const hello = await admin.command({ hello: 1 });
    if (hello.isWritablePrimary) break;
    if (attempt > 30) throw new Error('Timed out waiting for the replica set primary.');
    await new Promise(r => setTimeout(r, 1000));
  }

  const users = admin.collection('system.users');
  const auth = { mechanism: 'SCRAM-SHA-256' };

  // Maintenance account only; it cannot read application data.
  if (await users.findOne({ user: ADMIN_USER, db: 'admin' })) {
    await admin.command({ updateUser: ADMIN_USER, pwd: ADMIN_PASSWORD, roles: [{ role: 'userAdminAnyDatabase', db: 'admin' }], mechanisms: [auth.mechanism] });
    console.log(`Updated admin user "${ADMIN_USER}".`);
  } else {
    await admin.command({ createUser: ADMIN_USER, pwd: ADMIN_PASSWORD, roles: [{ role: 'userAdminAnyDatabase', db: 'admin' }], mechanisms: [auth.mechanism] });
    console.log(`Created admin user "${ADMIN_USER}".`);
  }

  // Application account, confined to a single database. dbOwner (rather than
  // readWrite) is required so the server can guarantee its unique indexes on
  // startup; it still grants nothing outside ${APP_DB}.
  const APP_ROLE = process.env.MONGO_APP_ROLE || 'dbOwner';
  const appDb = client.db(APP_DB);
  if (await users.findOne({ user: APP_USER, db: APP_DB })) {
    await appDb.command({ updateUser: APP_USER, pwd: APP_PASSWORD, roles: [{ role: APP_ROLE, db: APP_DB }], mechanisms: [auth.mechanism] });
    console.log(`Updated application user "${APP_USER}" (${APP_ROLE} on ${APP_DB}).`);
  } else {
    await appDb.command({ createUser: APP_USER, pwd: APP_PASSWORD, roles: [{ role: APP_ROLE, db: APP_DB }], mechanisms: [auth.mechanism] });
    console.log(`Created application user "${APP_USER}" (${APP_ROLE} on ${APP_DB}).`);
  }

  // An earlier mistake can leave a copy of the application user in the admin
  // database, where it would be far more powerful than intended.
  if (await users.findOne({ user: APP_USER, db: 'admin' })) {
    await admin.command({ dropUser: APP_USER });
    console.log(`Removed the stray admin-database copy of "${APP_USER}".`);
  }

  // Indexes are declared in the Mongoose schemas and are created by the server on
  // startup with the application account, so no index work is needed here.

  console.log('\nMongoDB is ready.');
  if (bootstrapped) console.log('Restart mongod with --auth to enforce authentication.');
} finally {
  await client.close();
}
