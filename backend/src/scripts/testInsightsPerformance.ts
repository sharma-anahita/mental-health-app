import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

async function testInsightsPerformance() {
  try {
    console.log('🚀 Testing Insights Cache Performance\n');

    // Step 1: Authenticate
    console.log('1️⃣  Authenticating...\n');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'guest@gmail.com',
      password: 'guestlogsin',
    });

    const token = loginResponse.data.token;
    console.log('✅ Authenticated!\n');

    const headers = { Authorization: `Bearer ${token}` };

    // Step 2: Get initial stats
    console.log('2️⃣  Initial stats:');
    let statsResponse = await axios.get(`${API_BASE}/debug/cache-stats`);
    console.log(JSON.stringify(statsResponse.data, null, 2));
    console.log('');

    // Step 3: First request (CACHE MISS - full generation)
    console.log('3️⃣  Making FIRST insights request (should be CACHE MISS)...');
    const firstStart = Date.now();
    const firstResponse = await axios.get(`${API_BASE}/insights`, { headers });
    const firstDuration = Date.now() - firstStart;
    console.log(`✅ First request completed in ${firstDuration}ms\n`);

    // Step 4: Get updated stats
    console.log('4️⃣  Stats after first request:');
    statsResponse = await axios.get(`${API_BASE}/debug/cache-stats`);
    console.log(JSON.stringify(statsResponse.data, null, 2));
    console.log('');

    // Step 5: Second request (CACHE HIT - from Redis)
    console.log('5️⃣  Making SECOND insights request (should be CACHE HIT)...');
    const secondStart = Date.now();
    const secondResponse = await axios.get(`${API_BASE}/insights`, { headers });
    const secondDuration = Date.now() - secondStart;
    console.log(`✅ Second request completed in ${secondDuration}ms\n`);

    // Step 6: Get final stats
    console.log('6️⃣  Final stats after second request:');
    statsResponse = await axios.get(`${API_BASE}/debug/cache-stats`);
    console.log(JSON.stringify(statsResponse.data, null, 2));
    console.log('');

    // Step 7: Performance comparison
    console.log('📊 PERFORMANCE COMPARISON:\n');
    console.log(`  First request (cache miss):  ${firstDuration}ms`);
    console.log(`  Second request (cache hit):  ${secondDuration}ms`);
    const speedup = (firstDuration / secondDuration).toFixed(1);
    const improvement = (((firstDuration - secondDuration) / firstDuration) * 100).toFixed(1);
    console.log(`\n  🎉 Speedup: ${speedup}x faster`);
    console.log(`  🎉 Improvement: ${improvement}% faster`);

  } catch (err: any) {
    console.error('❌ Error:', err.response?.data || err.message);
  }
}

testInsightsPerformance();
