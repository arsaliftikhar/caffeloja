/**
 * Converts MongoDB Atlas SRV URI to standard direct replica set URI when needed,
 * completely avoiding Windows c-ares "querySrv ECONNREFUSED" DNS failures.
 */
export function normalizeMongoUri(rawUri) {
  const uri = String(rawUri || '').trim();
  if (!uri) return uri;

  if (uri.startsWith('mongodb+srv://') && uri.includes('cluster0.zmsgdfg.mongodb.net')) {
    const match = uri.match(/^mongodb\+srv:\/\/([^:]+):([^@]+)@cluster0\.zmsgdfg\.mongodb\.net\/?([^?]*)/);
    if (match) {
      const user = match[1];
      const pass = match[2];
      const db = match[3] || 'caffeloja';
      return `mongodb://${user}:${pass}@ac-qrapkkp-shard-00-00.zmsgdfg.mongodb.net:27017,ac-qrapkkp-shard-00-01.zmsgdfg.mongodb.net:27017,ac-qrapkkp-shard-00-02.zmsgdfg.mongodb.net:27017/${db}?ssl=true&replicaSet=atlas-va7r9f-shard-0&authSource=admin&retryWrites=true&w=majority`;
    }
  }

  return uri;
}

