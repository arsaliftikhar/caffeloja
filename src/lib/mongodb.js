import { MongoClient } from 'mongodb';
import dns from 'dns';
import { normalizeMongoUri } from './mongoUri.js';

// Ensure MongoDB SRV queries resolve reliably on local environments without affecting Vercel serverless DNS
if (!process.env.VERCEL && dns && typeof dns.setServers === 'function') {
  try {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
  } catch {}
}

const uri = normalizeMongoUri(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/caffeloja');
const options = {};

let client;
let clientPromise;

if (!process.env.MONGODB_URI) {
  console.warn('⚠️ Please add your Mongo URI to .env.local: MONGODB_URI=...');
}

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise;
