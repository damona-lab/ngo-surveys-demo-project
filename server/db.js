import mongoose from 'mongoose';
import { MODELS } from './models.js';

const uri = process.env.MONGODB_URI || process.env.MONGO_URI || process.env.MONGO_URL;
if (!uri) throw new Error('Set MONGODB_URI before starting the server.');

export const connection = mongoose.connection;

export function isDuplicateKeyError(err) {
  return Boolean(err) && (err.code === 11000 || err.code === 11001);
}

export const isValidationError = err => err instanceof mongoose.Error.ValidationError;

// Multi-document transactions need a replica set or sharded cluster. A standalone
// mongod has neither, so the server falls back to atomic single-document updates.
let transactionsAvailable = false;

export async function connectDatabase() {
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: Number(process.env.DB_TIMEOUT_MS || 10000),
    maxPoolSize: 10,
    minPoolSize: 1,
    retryWrites: true,
    tls: process.env.DB_SSL === 'true' ? {} : undefined,
  });
  // Schema definitions carry the indexes, so a fresh database needs no migration step.
  for (const model of MODELS) await model.createIndexes();
  try {
    const hello = await connection.db.admin().command({ hello: 1 });
    transactionsAvailable = Boolean(hello.setName) || hello.msg === 'isdbgrid';
  } catch {
    transactionsAvailable = false;
  }
  if (!transactionsAvailable) {
    console.warn('MongoDB is not a replica set: running without multi-document transactions.');
  }
  return connection;
}

export async function ping() {
  return connection.db.admin().command({ ping: 1 });
}

export async function closeDatabase() {
  await mongoose.disconnect();
}

// Attaches a transaction session to a query. Model.findOne and Model.exists treat
// a second positional argument as a projection, so the session must be applied
// through the query builder instead of an options object.
export const inSession = (query, session) => (session ? query.session(session) : query);

// Runs `work` inside a transaction when the deployment supports one, otherwise runs
// it directly. The work function must be written so that either path stays safe.
export async function runInTransaction(work) {
  if (!transactionsAvailable) return work(null);
  return connection.transaction(session => work(session));
}
