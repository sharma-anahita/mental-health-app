import axios from 'axios';
import { Redis } from '@upstash/redis';
import * as dotenv from 'dotenv';

dotenv.config();

const API_BASE = 'http://localhost:5000/api';
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

async function testFreshCacheMiss() {
  try {
    console.log('🚀 Testing with Fresh Cache Miss\n');

    // Step 1: Authenticate
    console.log('1️⃣  Authenticating...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'guest@gmail.com',
      password: 'guestlogsin',
    });

    const token = loginResponse.data.token;
    const userId = loginResponse.data.user.id;
    const headers = { Authorization: `Bearer ${token}` };
    console.log(`✅ Authenticated! userId=${userId}\n`);

    // Step 2: Clear the cache for this user
    console.log('2️⃣  Clearing insights cache...');
    const cacheKey = `insights:${userId}`;
    await redis.del(cacheKey);
    console.log(`✅ Cache cleared for ${cacheKey}\n`);

    // Step 3: Make first request (guaranteed CACHE MISS with full generation)
    console.log('3️⃣  Making first insights request (guaranteed CACHE MISS with full generation)...');
    console.log('📊 Watch the terminal logs for detailed [PERF] timing breakdown...\n');
    const firstStart = Date.now();
    const firstResponse = await axios.get(`${API_BASE}/insights`, { headers });
    const firstDuration = Date.now() - firstStart;
    
    console.log(`✅ First request completed in ${firstDuration}ms\n`);
    console.log(`Response includes ${firstResponse.data.trendData?.length ?? 0} trend points, ${firstResponse.data.insightCards?.length ?? 0} insight cards\n`);

    // Step 4: Get stats
    console.log('4️⃣  Cache statistics after first request:');
    const statsResponse = await axios.get(`${API_BASE}/debug/cache-stats`);
    console.log(JSON.stringify(statsResponse.data, null, 2));
    console.log('');

    // Step 5: Make second request (should hit cache)
    console.log('5️⃣  Making second insights request (should be CACHE HIT)...');
    const secondStart = Date.now();
    const secondResponse = await axios.get(`${API_BASE}/insights`, { headers });
    const secondDuration = Date.now() - secondStart;
    
    console.log(`✅ Second request completed in ${secondDuration}ms\n`);
    console.log(`🎉 Speedup: ${(firstDuration / secondDuration).toFixed(1)}x faster`);
    console.log(`🎉 Improvement: ${(((firstDuration - secondDuration) / firstDuration) * 100).toFixed(1)}% faster\n`);

  } catch (err: any) {
    console.error('❌ Error:', err.response?.data || err.message);
    console.error('Full error:', err);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

testFreshCacheMiss();
