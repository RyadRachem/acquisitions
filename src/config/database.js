import 'dotenv/config';

import {neon, neonConfig} from '@neondatabase/serverless';
import {drizzle} from 'drizzle-orm/neon-http';

// Configure Neon serverless driver to route HTTP queries to Neon Local proxy if endpoint is provided
if (process.env.NEON_FETCH_ENDPOINT) {
  neonConfig.fetchEndpoint = process.env.NEON_FETCH_ENDPOINT;
  neonConfig.useSecureWebSocket = false;
  neonConfig.poolQueryViaFetch = true;
}

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql);

export {db,sql};