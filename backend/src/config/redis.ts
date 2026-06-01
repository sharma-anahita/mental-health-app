import dotenv from 'dotenv';
import { Redis } from '@upstash/redis';

// Load environment variables from .env (if present)
dotenv.config();

const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

if (!UPSTASH_URL || !UPSTASH_TOKEN) {
  throw new Error('Missing UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN environment variables');
}

const redis = new Redis({
  url: UPSTASH_URL,
  token: UPSTASH_TOKEN,
});

export default redis;