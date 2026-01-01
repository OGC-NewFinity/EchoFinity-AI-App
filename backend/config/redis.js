const redis = require('redis');

const redisClient = redis.createClient({
  socket: {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: process.env.REDIS_PORT || 6379,
  },
  password: process.env.REDIS_PASSWORD || undefined,
});

redisClient.on('error', err => console.error('Redis Error:', err));

const connectRedis = async () => {
  if (!redisClient.isOpen) {
    await redisClient.connect();
    console.log('✅ Redis connected');
  }
};

module.exports = { redisClient, connectRedis };
