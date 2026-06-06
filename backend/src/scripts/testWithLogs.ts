import axios from 'axios';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const API_BASE = 'http://localhost:5000/api';

async function testWithDetailedLogs() {
  try {
    console.log('🚀 Testing with detailed logs\n');

    // Authenticate
    console.log('1️⃣  Authenticating...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'guest@gmail.com',
      password: 'guestlogsin',
    });

    const token = loginResponse.data.token;
    const headers = { Authorization: `Bearer ${token}` };
    console.log('✅ Authenticated!\n');

    // Make request and measure locally
    console.log('2️⃣  Making insights request (cache miss expected)...');
    const requestStart = Date.now();
    const response = await axios.get(`${API_BASE}/insights`, { headers });
    const requestDuration = Date.now() - requestStart;
    
    console.log(`✅ Request completed in ${requestDuration}ms\n`);
    console.log(`Response has ${response.data.trendData?.length ?? 0} trend points, ${response.data.distributionData?.length ?? 0} mood distribution items, ${response.data.insightCards?.length ?? 0} insight cards\n`);

    // Get stats
    console.log('3️⃣  Cache statistics:');
    const statsResponse = await axios.get(`${API_BASE}/debug/cache-stats`);
    console.log(JSON.stringify(statsResponse.data, null, 2));
    console.log('');

    // Make second request (should hit cache)
    console.log('4️⃣  Making second insights request (cache hit expected)...');
    const secondStart = Date.now();
    const secondResponse = await axios.get(`${API_BASE}/insights`, { headers });
    const secondDuration = Date.now() - secondStart;
    
    console.log(`✅ Second request completed in ${secondDuration}ms\n`);
    console.log(`🎉 Speedup: ${(requestDuration / secondDuration).toFixed(1)}x faster`);
    console.log(`🎉 Improvement: ${(((requestDuration - secondDuration) / requestDuration) * 100).toFixed(1)}% faster\n`);

  } catch (err: any) {
    console.error('❌ Error:', err.response?.data || err.message);
  }
}

testWithDetailedLogs();
