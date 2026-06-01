import redis from '../config/redis';

(async () => {
  try {
    await redis.set('test', 'hello');
    const value = await redis.get('test');
    console.log('redis.get("test") =>', value);
  } catch (err) {
    console.error('Redis test failed:', err);
    process.exit(1);
  }
  process.exit(0);
})();
